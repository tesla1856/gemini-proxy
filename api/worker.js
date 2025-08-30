export const config = {
  runtime: 'edge',
};

export default async function fetch(request) {
    // URL внешнего сервера
    const externalUrl = "https://generativelanguage.googleapis.com";

    // Формирование полного URL для запроса
    const url = new URL(request.url);
    const proxiedUrl = externalUrl + url.pathname + url.search;

    console.log(`Проксирование: ${request.method} ${url.pathname} -> ${proxiedUrl}`);

    try {
      // Создаем новый объект заголовков и фильтруем его
      const newHeaders = new Headers(request.headers);
      newHeaders.delete('host'); // Самое важное!
      newHeaders.delete('x-forwarded-for');
      newHeaders.delete('x-forwarded-proto');
      newHeaders.delete('x-real-ip');
      newHeaders.delete('connection');

      // Проксирование запроса с отфильтрованными заголовками
      const proxiedRequest = new Request(proxiedUrl, {
        method: request.method,
        headers: newHeaders,
        body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
        redirect: 'follow',
      });
      
      // Выполнение запроса к внешнему API
      const response = await fetch(proxiedRequest);
      console.log(`Ответ от ${proxiedUrl}: ${response.status}`);

      // Возврат ответа клиенту
      return response;

    } catch (error) {
      // Обработка ошибок
      console.error("КРИТИЧЕСКАЯ ОШИБКА:", error.message, error.stack);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
