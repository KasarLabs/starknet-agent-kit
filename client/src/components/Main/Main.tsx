'use client';
import Image from 'next/image';
import { assets } from '@/src/app/assets/assets';
import './main.css';
import React, { useState, useEffect, use, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import MarkdownIt from 'markdown-it';
import { WalletAccount } from 'starknet';
import { connectWallet } from '@/src/app/wallet/wallet';
import {
  AgentResponse,
  TransactionResponse,
} from '@/src/interfaces/starknetagents';
import { handleInvokeTransactions } from '@/src/transactions/InvokeTransactions';
import { ACCOUNT } from '@/src/interfaces/accout';
import { InvokeTransaction } from '@/src/types/starknetagents';
import { handleDeployTransactions } from '@/src/transactions/DeployAccountTransactions';
import { CreateOutputRequest } from '@/src/output/output';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from '@/src/components/ui/select';
import { disconnect } from '@starknet-io/get-starknet';

interface saveConversation {
  input: string;
  output: string;
}

interface Message {
  id: string;
  type: string;
  text: string;
  timestamp: string;
}

const Main = () => {
  const [input, setInput] = useState('');
  const [currentResponse, setCurrentResponse] = useState<AgentResponse | null>(
    null
  );

  const [messages, setMessages] = useState<Message[]>([]);

  const [isResponse, setResponse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [Wallet, setWallet] = useState<WalletAccount | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>('wallet');
  const [selectedStyle, setSelectedStyle] = useState<string>('standard');
  const messagesEndRed = useRef<null | HTMLDivElement>(null);

  const md = new MarkdownIt({ breaks: true });

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

  useEffect(() => {
    messagesEndRed.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const styles = {
    gradientText: {
      background: '-webkit-linear-gradient(16deg, #4b90ff, #ff5546)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
  };

  const handleConnect = async () => {
    try {
      const address = await connectWallet();
      if (address == undefined) {
        throw new Error('wallet connect fail');
      }
      setIsConnected(true);
      setSelectedMode('wallet');
      setWallet(address);
      console.log('Connected');
    } catch (error) {
      console.log('Error', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      const handle = await disconnect();
      setIsConnected(false);
      setSelectedMode('key');
      setWallet(null);
    } catch (error) {
      console.log('Error', error);
    }
  };

  const handleCardClick = (text: string) => (e: React.FormEvent) => {
    e.preventDefault();

    console.log();
    const event = {
      target: {
        value: text,
      },
    };

    setInput(event.target.value);
    console.log(input);
    handleSubmitButton(e);
  };

  const handleSubmitButton = (e: React.FormEvent) => {
    e.preventDefault();

    console.log(input);
    const InputMessage = {
      id: (Date.now() + 1).toString(),
      type: 'input',
      text: input,
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toString(),
    };

    setMessages((prev) => [...prev, InputMessage]);
    setResponse(true);
    if (selectedMode === 'wallet') {
      handleSubmitWallet(e);
    } else {
      handleSubmit(e);
    }
  };

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
            href={`https://starkscan.co/contract/${found}`}
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
  const getResponseText = async (text: string): Promise<string> => {
    if (selectedStyle === 'call-data') {
      return text;
    }
    const output_text = await CreateOutputRequest(text);
    return output_text;
  };

  const typeResponse = async (response: AgentResponse) => {
    console.log(response);
    const text = await getResponseText(response.text);
    const OutputMessage = {
      id: (Date.now() + 1).toString(),
      type: 'output',
      text: text,
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toString(),
    };
    setMessages((prev) => [...prev, OutputMessage]);
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

  const handleSubmitWallet = async (e: React.FormEvent) => {
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
      const response = await fetch('/api/wallet/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify({ request: input }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (!Wallet) {
        throw new Error('Wallet not initialized. Please connect your wallet.');
      }

      const result = await response.json();

      let tx;
      if (result.transaction_type === 'INVOKE') {
        tx = handleInvokeTransactions(result as TransactionResponse);
        if (!tx) {
          throw new Error(
            'The Invoke transaction is in the wrong format. Check the API Response'
          );
        }
        const transaction_hash = await Wallet.execute(tx);
        typeResponse({
          ...newResponse,
          text: JSON.stringify(JSON.stringify({ tx, transaction_hash })),
        });
      } else if (result.transaction_type === 'READ') {
        typeResponse({
          ...newResponse,
          text: JSON.stringify(JSON.stringify(result)),
        });
      } else if (
        result.transaction_type === 'CREATE_ACCOUNT' &&
        result.status === 'success'
      ) {
        const account_details = result as ACCOUNT;
        if (!account_details) {
          throw new Error('Account not set');
        }
        const tx: InvokeTransaction = {
          contractAddress:
            '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
          entrypoint: 'transfer',
          calldata: [
            account_details.contractaddress,
            account_details.deploy_fee,
            '0x0',
          ],
        };
        const deploy_account_response = handleDeployTransactions(
          Wallet,
          tx,
          result.wallet,
          account_details.public_key,
          account_details.private_key,
          account_details.contractaddress
        );

        typeResponse({
          ...newResponse,
          text: await deploy_account_response,
        });
      }
      if (!tx && result.transaction_type != 'READ') {
        throw new Error(
          'The transactions has to be an INVOKE or DeployAccount transaction'
        );
      }
    } catch (error) {
      console.error('Request error:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      typeResponse({
        ...newResponse,
        text: `Error: ${errorMessage}\nPlease try again or contact support if the issue persists.`,
      });
    } finally {
      setIsLoading(false);
      setInput('');
    }
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
      const response = await fetch('/api/key/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify({ request: input }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(errorText);
      }

      const data = await response.json();
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from server');
      }

      const formattedText = formatResponse(JSON.stringify(data));
      typeResponse({ ...newResponse, text: formattedText });
    } catch (error) {
      console.error('Request error:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      typeResponse({
        ...newResponse,
        text: `Error: ${errorMessage}\nPlease try again or contact support if the issue persists.`,
      });
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };
  return (
    <div className="main">
      <div className="nav">
        <p>StarknetAgent</p>
        <Image src={assets.kasar} alt="Kasar logo" />
      </div>

      <div className="main-container">
        {!isResponse ? (
          <>
            <div className="greet">
              <p>
                <span>Hello, Etienne.</span>
              </p>
              <p>What can i do for you today ?</p>
            </div>
            <div className="cards">
              <div
                className="card"
                onClick={handleCardClick(
                  'Can you transfer all my ETH to 0x07f096F9DD04b247B6d10eCEa4c50d30a1FEB5B6695b74d4E9D17e4Aa9cE44EC'
                )}
              >
                <p>Can you transfer 1 STRK to Nathan wallet</p>
                <Image src={assets.compass} alt="Transfer ETH icon" />
              </div>
              <div className="card">
                <p>Swap 0.5 my ETH to USDT</p>
                <Image src={assets.bulb} alt="Swap icon" />
              </div>
              <div className="card">
                <p>Can you tell me my balances</p>
                <Image src={assets.message} alt="Balance check icon" />
              </div>
              <div className="card">
                <p>When starket-agent-kit will be announce</p>
                <Image src={assets.code} alt="Code icon" />
              </div>
            </div>
          </>
        ) : (
          <div className="result">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-wrapper ${message.type === 'input' ? 'message-input' : 'message-output'}`}
              >
                {message.type === 'output' && (
                  <div className="message-output-logo">
                    <Image src={assets.kasar} alt="logo" />
                  </div>
                )}
                <div
                  className={`message ${message.type === 'output' ? 'message-output-bubble' : 'message-input-bubble'}`}
                >
                  <p className="message-text">{message.text}</p>
                  <p className="message-timestamp">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            <div ref={messagesEndRed}></div>
          </div>
        )}
        {!isConnected ? (
          <button onClick={handleConnect} className="connect-wallet-button">
            ConnectWallet
          </button>
        ) : (
          <button onClick={handleDisconnect} className="connect-wallet-button">
            Disconnect
          </button>
        )}
        <div className="main-bottom">
          <div className="search-box">
            <div className="input-wrapper">
              <form onSubmit={handleSubmitButton} className="relative">
                <Input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your request..."
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
              <div className="send">
                <Image src={assets.send} alt="Send message" />
              </div>
            </div>

            <div className="search-box-options">
              <Select value={selectedMode} onValueChange={setSelectedMode}>
                <SelectTrigger className="select-trigger">
                  <SelectValue placeholder="Settings" />
                </SelectTrigger>
                <SelectContent className="select-content">
                  <SelectGroup>
                    <SelectLabel>Choose Kasar Mode</SelectLabel>
                    {/* Kasar 3.5 Key toujours visible */}
                    <SelectItem className="select-item" value="key">
                      Kasar 3.5 Key
                    </SelectItem>
                    {/* Autres options visibles uniquement si connecté */}
                    {isConnected && (
                      <SelectItem className="select-item" value="wallet">
                        Kasar 3.5 Wallet
                      </SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger className="select-trigger">
                  <SelectValue placeholder="Signature" />
                </SelectTrigger>
                <SelectContent className="select-content">
                  <SelectGroup>
                    <SelectLabel>Select Style</SelectLabel>
                    <SelectItem className="select-item" value="standard">
                      Standard
                    </SelectItem>
                    <SelectItem className="select-item" value="call-data">
                      Calldata
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
