# AgentWork Project

Проект AgentWork - это веб-приложение, построенное на Next.js и Node.js, использующее Supabase для хранения данных и API Anthropic для работы с ИИ.

## Требования

- Node.js 18+ 
- npm или yarn
- Supabase аккаунт
- Anthropic API ключ

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/agentwork.git
cd agentwork
```

2. Установите зависимости для фронтенда:
```bash
npm install
```

3. Установите зависимости для бекенда:
```bash
cd backend
npm install
cd ..
```

4. Настройте переменные окружения:
   - Скопируйте `backend/.env.example` в `backend/.env`
   - Заполните все необходимые переменные окружения в файле `.env`

## Запуск проекта

1. Запустите бекенд:
```bash
cd backend
npm run dev
```

2. В новом терминале запустите фронтенд:
```bash
npm run dev
```

Приложение будет доступно по адресу:
- Фронтенд: http://localhost:3000
- Бекенд: http://localhost:3001

## Структура проекта

```
agentwork/
├── app/                # Next.js фронтенд компоненты и страницы
├── backend/           # Node.js бекенд
│   ├── src/          # Исходный код бекенда
│   └── prisma/       # Prisma схемы и миграции
├── components/        # React компоненты
├── public/           # Статические файлы
└── styles/           # CSS стили
```

## Технологический стек

- Frontend: Next.js, React, TypeScript
- Backend: Node.js, Express, TypeScript
- Database: Supabase
- AI: Anthropic API
- Styling: Tailwind CSS

## Разработка

При внесении изменений в проект, пожалуйста, следуйте этим правилам:

1. Создавайте новую ветку для каждой фичи/исправления
2. Следуйте принятым соглашениям по именованию и стилю кода
3. Пишите понятные commit сообщения
4. Обновляйте документацию при необходимости

## Лицензия

MIT
