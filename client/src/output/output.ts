export const CreateOutputRequest = async (input: string): Promise<string> => {
  try {
    if (!input) {
      throw new Error('Your Input is null');
    }
    const response = await fetch('/api/wallet/output', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
      },
      body: JSON.stringify({ request: JSON.stringify(input) }),
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

    const result = await response.json();
    if (!result.output[0].text) {
      throw new Error(
        'The result parsing fail make sure the request is in json format'
      );
    }
    return JSON.stringify(result.output[0].text).slice(1, -1);
  } catch (error) {
    return `Error : ${error}}`;
  }
};
