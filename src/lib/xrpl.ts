import { Client } from "xrpl";

export const connect = async () => {
  const client = new Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL!);
  await client.connect();
  return client;
};

export const disconnect = async (client: Client) => {
  await client.disconnect();
};

export const getAccountInfo = async (client: Client, address: string) => {
  try {
    const response = await client.request({
      command: "account_info",
      account: address,
      ledger_index: "validated",
    });
    return response.result.account_data;
  } catch (error) {
    console.error("Error getting account info:", error);
    return null;
  }
};
