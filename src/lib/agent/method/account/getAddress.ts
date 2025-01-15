export const getAddress = async () => {
  try {
    const accountAddress = process.env.PUBLIC_ADDRESS;

    if (!accountAddress) {
      throw new Error(
        'No public address found. Please set PUBLIC_ADDRESS in your .env file!'
      );
    }

    return JSON.stringify({
      status: 'success',
      accountAddress,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
