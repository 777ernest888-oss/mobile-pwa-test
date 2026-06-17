// Ссылка на вашего Google-робота, которую вы получили
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzylPgpqaP9zXpbfsZryxY21ZXS30B_Nhhl_ClHfCOfpVmrm1EaQISbu5cXM6p-yTEM/exec";

document.addEventListener('DOMContentLoaded', () => {
    // Безопасно будим Telegram SDK, если мы внутри WebView
    if (window.Telegram?.WebApp) {
        try {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
        } catch (e) {
            console.error("SDK Error:", e);
        }
    }
   
    // Запускаем чтение таблицы
    loadSafeData();
});

async function loadSafeData() {
    const spinner = document.getElementById('spinner');
    const appContainer = document.getElementById('app');
    const statusText = document.getElementById('spinner-status');

    try {
        if (statusText) statusText.innerText = "[1/2] Запрос к защищенному хранилищу...";
       
        // Предохранитель: если сеть «зависнет», через 8 секунд сбросить ожидание
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(GOOGLE_SCRIPT_URL, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("Google сервер отклонил запрос");

        if (statusText) statusText.innerText = "[2/2] Фильтрация полей завершена. Отрисовка...";
        const rawData = await response.json();
       
        // Разделяем: headers - первая строка (шапка), rows - сами объекты
        const [headers, ...rows] = rawData;
       
        renderCatalogCards(headers, rows);

        // Включаем интерфейс
        if (spinner) spinner.style.display = 'none';
        if (appContainer) appContainer.style.display = 'block';

    } catch (error) {
        console.error("Ошибка загрузки:", error);
        if (statusText) {
            statusText.style.color = "#ff3333";
            statusText.innerText = `Сбой: ${error.name === 'AbortError' ? 'Медленный интернет (Таймаут)' : error.message}`;
        }
    }
}

function renderCatalogCards(headers, rows) {
    const container = document.getElementById('catalog-list');
    if (!container) return;

    container.innerHTML = "";

    if (rows.length === 0) {
        container.innerHTML = "<p style='text-align:center;color:#888;'>В каталоге пока нет объектов</p>";
        return;
    }

    rows.forEach(row => {
        const card = document.createElement('div');
        card.className = "object-card";
       
        // Мы берем первые 3 колонки из таблицы для теста витрины
        const title = row[0] || "Объект без названия";
        const price = row[1] || "Цена по запросу";
        const desc = row[2] || "Описание отсутствует";

        card.innerHTML = `
            <div class="title">${title}</div>
            <div class="price">${price}</div>
            <div class="desc">${desc}</div>
        `;
        container.appendChild(card);
    });
}
