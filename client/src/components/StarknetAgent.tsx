'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MarkdownIt from 'markdown-it';
import UploadFile, { removeFile } from './ui/uploadFile';

const md = new MarkdownIt({ breaks: true });

interface AgentResponse {
  text: string;
  timestamp: number;
  isTyping: boolean;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
}

const StarknetAgent = () => {
  const [input, setInput] = useState('');
  const [currentResponse, setCurrentResponse] = useState<AgentResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);

  // When in loading state for >5s, we show "Processing..."
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isLoading) {
      timeoutId = setTimeout(() => {
        setShowLoadingMessage(true);
      }, 5000);
    } else {
      setShowLoadingMessage(false);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  /**
   * Shorten a full StarkNet/Ethereum transaction hash (0x + 64 hex chars)
   * e.g. "0x0123abcd...ffff" => "0x01...fff"
   */
  const shortenTxHash = (hash: string) => {
    // "0x" (2 chars) + 2 + "..." + 3 = total ~10 visible chars
    return `0x${hash.slice(2, 4)}...${hash.slice(-3)}`;
  };

  /**
   * Shorten any URL, e.g. https://example.com/very/long/path => example.com/...
   */
  const shortenUrl = (url: string) => {
    try {
      const { hostname } = new URL(url);
      return `${hostname}/...`;
    } catch {
      // Fallback: if parsing fails, just return the original (or do something else)
      return url;
    }
  };

  /**
   * Convert transaction hashes and links into shortened clickable text.
   *
   * - If it's a direct hash like "0xabc123...." => link to https://starkscan.co/tx/{hash}
   * - If it's already a Starkscan link => use that link directly
   * - If it's any other URL => make it clickable + shorten
   */
  const parseAndDisplayWithShortLinks = (text: string) => {
    // Matches:
    // 1) https://starkscan.co/tx/0x + 64 hex chars
    // 2) 0x + 64 hex chars (standalone hash)
    // 3) any http(s):// link
    const regex =
      /((?:https?:\/\/starkscan\.co\/tx\/0x[a-fA-F0-9]{64})|0x[a-fA-F0-9]{64}|https?:\/\/[^\s]+)/g;
    const parts: Array<string | React.ReactElement> = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const found = match[0];
      const start = match.index;
      const end = regex.lastIndex;

      // Push the text before this match
      parts.push(text.slice(lastIndex, start));

      // Determine how to create the link
      if (found.startsWith('0x') && found.length === 66) {
        // It's a standalone hash (0x + 64 hex chars).
        // Link to starkscan using the full hash:
        const shortened = shortenTxHash(found);
        parts.push(
          <a
            key={start}
            href={`https://starkscan.co/tx/${found}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 underline"
          >
            {shortened}
          </a>
        );
      } else if (found.includes('starkscan.co/tx/0x')) {
        // It's already a Starkscan link
        // Optionally parse out the raw hash for the display:
        const rawHash = found.split('/tx/')[1] ?? '';
        const shortened =
          rawHash.startsWith('0x') && rawHash.length === 66
            ? shortenTxHash(rawHash)
            : shortenUrl(found);
        parts.push(
          <a
            key={start}
            href={found}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 underline"
          >
            {shortened}
          </a>
        );
      } else if (found.startsWith('http')) {
        // Generic link: just shorten for display
        parts.push(
          <a
            key={start}
            href={found}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 underline"
          >
            {shortenUrl(found)}
          </a>
        );
      } else {
        // Fallback — in case something is matched unexpectedly
        parts.push(found);
      }

      lastIndex = end;
    }

    // Push any remaining text after the last match
    parts.push(text.slice(lastIndex));

    return parts;
  };

  /**
   * Strip away known extraneous OpenAI formatting from the JSON response.
   */
  const formatResponse = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);

      // Extract the text content from the response
      let extractedText = '';

      // Handle the result structure from your backend
      if (data.result?.output?.[0]?.text) {
        extractedText = data.result.output[0].text;
      }
      // Handle direct output structure
      else if (data.output?.[0]?.text) {
        extractedText = data.output[0].text;
      }
      // Handle direct text
      else if (typeof data === 'string') {
        extractedText = data;
      }

      // Clean up extra newlines and whitespace
      extractedText = extractedText.trim();

      // Convert markdown to HTML
      return md.render(extractedText);
    } catch (error) {
      console.error('Error formatting response:', error);
      return jsonString;
    }
  };

  /**
   * Simulate typing in the UI.
   */
  const typeResponse = (response: AgentResponse) => {
    const text = response.text;
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      setCurrentResponse((prevResponse) => {
        if (!prevResponse) return prevResponse;
        return {
          ...prevResponse,
          text: text.slice(0, currentIndex + 1),
          isTyping: currentIndex < text.length - 1,
        };
      });

      currentIndex++;
      if (currentIndex >= text.length) {
        clearInterval(typingInterval);
      }
    }, 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setShowLoadingMessage(false);

    const newResponse = {
      text: '',
      timestamp: Date.now(),
      isTyping: true,
    };

    setCurrentResponse(newResponse);

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        console.log(formData.get('file'));
        const resp = await fetch('/api/agent/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
          },
          body: selectedFile,
        });
      }
      //   const response = await fetch('/api/agent/request', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
      //     },
      //     body: JSON.stringify({ request: input }),
      //     credentials: 'include',
      //   });

      //   // Ajout d'un meilleur logging des erreurs
      //   if (!response.ok) {
      //     const errorText = await response.text();
      //     console.error('API Error:', {
      //       status: response.status,
      //       statusText: response.statusText,
      //       body: errorText,
      //     });
      //     throw new Error(errorText);
      //   }

      //   const data = await response.json();

      //   // Validation de la structure de données
      //   if (!data || typeof data !== 'object') {
      //     throw new Error('Invalid response format from server');
      //   }

      //   const formattedText = formatResponse(JSON.stringify(data));
      //   typeResponse({ ...newResponse, text: formattedText });
      // } catch (error) {
      //   console.error('Request error:', error);

      //   const errorMessage =
      //     error instanceof Error ? error.message : 'An unexpected error occurred';

      //   typeResponse({
      //     ...newResponse,
      //     text: `Error: ${errorMessage}\nPlease try again or contact support if the issue persists.`,
      //   });
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg -mt-32 flex flex-col gap-4 md:gap-8">
        <div className="flex items-center gap-3 md:gap-4 px-2 md:px-0">
          <div className="relative w-8 h-8 md:w-10 md:h-10">
            <Image
              src="https://pbs.twimg.com/profile_images/1834202903189618688/N4J8emeY_400x400.png"
              alt="Starknet Logo"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <h1 className="text-lg md:text-2xl font-semibold text-white">
            Starknet Agent
          </h1>
        </div>

        <Card className="w-full bg-neutral-900 border-neutral-800 shadow-xl">
          <CardContent className="p-3 md:p-6 space-y-4 md:space-y-6">
            <form onSubmit={handleSubmit} className="relative">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full bg-neutral-800 border-neutral-700 text-neutral-100 pr-12 focus:ring-2 focus:ring-blue-500 text-sm md:text-base py-2 md:py-3"
                placeholder="Type your request..."
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:scale-110 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                ) : (
                  <Send className="h-3 w-3 md:h-4 md:w-4" />
                )}
              </Button>
            </form>

            <UploadFile
              fileInfo={fileInfo}
              setFileInfo={setFileInfo}
              setSelectedFile={setSelectedFile}
            />

            {currentResponse && (
              <Alert className="bg-neutral-800 border-neutral-700">
                <AlertDescription className="text-xs md:text-sm text-neutral-200 font-mono whitespace-pre-wrap break-words leading-relaxed">
                  {showLoadingMessage
                    ? 'Processing...'
                    : parseAndDisplayWithShortLinks(currentResponse.text)}
                  {(currentResponse.isTyping || isLoading) && (
                    <span className="animate-pulse ml-1">▋</span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StarknetAgent;
