import {
  CreateOZAccount,
  CreateArgentAccount,
} from 'src/lib/agent/method/account/createAccount';

describe('Account -> CreateOZAccount', () => {
  describe('With perfect match inputs', () => {});
  it('should return account public/private key and precalculate_address', async () => {
    const result = await CreateOZAccount();
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      status: 'success',
      wallet: 'Open Zeppelin',
      new_account_publickey: expect.any(String),
      new_account_privatekey: expect.any(String),
      precalculate_address: expect.any(String),
    });
  });
});

describe('Account -> CreateArgentAccount', () => {
  describe('With perfect match inputs', () => {});
  it('should return account public/private key and precalculate_address', async () => {
    // Act
    const result = await CreateArgentAccount();
    const parsed = JSON.parse(result);

    // Assert
    expect(parsed).toEqual({
      status: 'success',
      wallet: 'Argent',
      new_account_publickey: expect.any(String),
      new_account_privatekey: expect.any(String),
      precalculate_address: expect.any(String),
    });
  });
});
