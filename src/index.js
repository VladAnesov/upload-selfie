import 'core-js/features/map';
import 'core-js/features/set';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import '@vkontakte/vkui/dist/vkui.css';
// import registerServiceWorker from './sw';

// Если вы хотите, чтобы ваше веб-приложение работало в оффлайне и загружалось быстрее,
// расскомментируйте строку с registerServiceWorker();
// Но не забывайте, что на данный момент у технологии есть достаточно подводных камней
// Подробнее про сервис воркеры можно почитать тут — https://vk.cc/8MHpmT
// registerServiceWorker();

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

