import { REST } from "@abacatepay/rest";

const abacate = new REST({
  secret: process.env.ABACATEPAY_SECRET ?? process.env.ABACATEPAY_API_KEY,
  version: 1,
});

function apiKey() {
  const key = process.env.ABACATEPAY_SECRET ?? process.env.ABACATEPAY_API_KEY;
  if (!key)
    throw new Error("Configure ABACATEPAY_SECRET ou ABACATEPAY_API_KEY");
  return key;
}

function traduzirErroAbacatePay(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("API key version mismatch")) {
    return new Error(
      "AbacatePay recusou a autenticação: a secret atual não é compatível com a API v1 configurada.",
    );
  }

  return error instanceof Error ? error : new Error(message);
}

export async function criarOuBuscarCliente(dados: {
  email: string;
  name: string;
}) {
  apiKey();

  try {
    const customer = await abacate.post<{
      data: { id: string } | null;
      error: string | null;
    }>("/customer/create", {
      body: {
        name: dados.name,
        email: dados.email,
        cellphone: "00000000000",
        taxId: "00000000000",
      },
    });

    if (!customer.data?.id)
      throw new Error(customer.error ?? "Resposta inválida ao criar cliente");
    return { data: { id: customer.data.id } };
  } catch (error) {
    throw traduzirErroAbacatePay(error);
  }
}

export async function criarCheckoutAssinatura(dados: {
  customerId: string;
  externalId: string;
  returnUrl: string;
  completionUrl: string;
}) {
  apiKey();

  const productExternalId =
    process.env.ABACATEPAY_PRODUCT_EXTERNAL_ID ?? "plano-pro";
  const productName = process.env.ABACATEPAY_PRODUCT_NAME ?? "Plano Pro";
  const productPrice = Number(
    process.env.ABACATEPAY_PRODUCT_PRICE_CENTS ?? "2290",
  );
  if (!Number.isFinite(productPrice) || productPrice < 100) {
    throw new Error("ABACATEPAY_PRODUCT_PRICE_CENTS inválida");
  }

  const body = {
    frequency: "MULTIPLE_PAYMENTS" as const,
    products: [
      {
        externalId: productExternalId,
        name: productName,
        quantity: 1,
        price: productPrice,
        description: "Acesso ao plano Pro do Nutri App",
      },
    ],
    customerId: dados.customerId,
    methods: ["CARD"] as const,
    externalId: dados.externalId,
    returnUrl: dados.returnUrl,
    completionUrl: dados.completionUrl,
  };
  console.log(
    "[AbacatePay] criarCheckoutAssinatura body:",
    JSON.stringify(body),
  );

  try {
    const checkout = await abacate.post<{
      data: { id: string; url: string } | null;
      error: string | null;
    }>("/billing/create", { body });
    if (!checkout.data?.url)
      throw new Error(checkout.error ?? "Resposta inválida ao criar cobrança");
    return { data: { url: checkout.data.url, id: checkout.data.id } };
  } catch (error) {
    throw traduzirErroAbacatePay(error);
  }
}
