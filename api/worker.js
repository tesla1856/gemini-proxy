export const config = {
  runtime: 'edge',
};

export default {
  async fetch(request) {
    console.log("req=", request);
    // URL внешнего сервера
    const externalUrl = "https://generativelanguage.googleapis.com";

    // Формирование полного URL для запроса
    const url = new URL(request.url);
    const proxiedUrl = externalUrl + url.pathname + url.search;

    console.log("Оригинальный путь: ${url.pathname}");
    console.log("Проксирование на URL: ${proxiedUrl}");

    try {
      // Проксирование запроса
      const proxiedRequest = new Request(proxiedUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
      });

      // Выполнение запроса к внешнему API
      const response = await fetch(proxiedRequest);
      console.log("Получен ответ от целевого сервера. Статус: ${response.status}");

      // Возврат ответа клиенту
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (error) {
      // Обработка ошибок
      console.error("КРИТИЧЕСКАЯ ОШИБКА:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
