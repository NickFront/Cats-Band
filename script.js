// выбираем все  элементы с классом "modal" и сохраняем их в переменной modals
let modals = document.querySelectorAll('.modal');
//выбираем все элементы с атрибутом "data-action" и сохраняем их в переменной actions
let actions = document.querySelectorAll('[data-action]');
//выбираем первый элемент с классом "cats-container"
// и сохраняем его в переменной container.
let container = document.querySelector('.cats-container');
//выбираем форму с именем "add" и сохраняем ее в переменной addForm
let addForm = document.forms.add;
//ыбираем форму с именем "upd" и сохраняем ее в переменной updForm
let updForm = document.forms.upd;
let name = 'NickFront';
//получаем значение ключа "band-cats" из локального хранилища и сохраняем его в переменной cats.
let cats = localStorage.getItem('band-cats');
//проверяем, имеет ли переменная cats истинное значение. Если да, то преобразуем его из строки
// JSON в массив и сохраняем в переменную cats. 
//Если нет, то переменной cats присваивается пустой массив
cats = cats ? JSON.parse(cats) : [];

// функция getAllCats
const getAllCats = () => {

    //получаем значение ключа "band-cats" из локального хранилища и сохраняем его в const localData.
    const localData = localStorage.getItem('band-cats');

    //проверяем, есть ли значение в const localData.
    if (localData) {
        fillCatsContainer(localData); // Если значение есть, то вызывается 
        //функция fillCatsContainer с параметром localData

        //Если значение отсутствует, то выполняем GET-запрос на указанный URL
    } else {
        fetch(`https://cats.petiteweb.dev/api/single/${name}/show`)
            .then(res => res.json()) //извлекаем тело ответа в формате JSON и возвращает промис

            //обрабатываем успешно выполненный промис и 
            //передаем данные в виде параметра data в следующую функцию обратного вызова
            .then(data => {
                console.log(data);

                //проверяем есть ли свойство message в объекте data
                if (!data.message) {
                    cats = [...data]; //Если свойства message нет, то переменной cats присваиваем копию массива data
                    localStorage.setItem('band-cats', JSON.stringify(cats)); //сохраняем значение переменной cats в локальном хранилище
                    container.innerHTML = ''; //чистим содержимое элемента container.
                    fillCatsContainer(data); //вызываем функцию fillCatsContainer с параметром data.
                }
            });
    }
};

// объявляем функцию с именем fillCatsContainer, которая принимает аргумент data
const fillCatsContainer = (data) => {
    container.innerHTML = '';//очищаем контейнер, в котором будут отображаться карточки
    data.forEach(cat => {
        container.innerHTML += createCard(cat);// перебираем массив и добавляем HTML код в контейнер
    });
};
// устанавливаем обрабочик событий click
actions.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.action === 'reload') {
            localStorage.removeItem('band-cats');
            getAllCats();
        } else {
            Array.from(modals).find(m => m.dataset.type === btn.dataset.action).classList.add('active');
        }
    });
}); //Если кнопка имеет атрибут data-action со значением reload, 
//то при нажатии на эту кнопку из локального хранилища удаляется информация о кошках, 
//а затем запускается функция getAllCats, чтобы загрузить новые данные о кошках. 
//Если значение data-action другое, то скрипт ищет модальное окно с атрибутом data-type,
// который совпадает со значением data-action кнопки, и показывает его на экране, 
//добавляя класс active

//// Для каждого модального окна из массива modals выбираем элемент с классом modal-close
modals.forEach(m => {
    let close = m.querySelector('.modal-close');
    //устанавливаем обработчик кликов
    close.addEventListener('click', () => {
        m.classList.remove('active');//удаляем класс active из модального окна
        addForm.reset();//сбрасываем данные в формах
        updForm.reset();//сбрасываем данные в формах
    });
});

function setLike(id, el) {
    console.log(id);// id кошки для отладки в консоль
    // Для элемента (иконки-сердечка) переключаем классы 'fa-solid' и 'fa-regular'
    el.classList.toggle('fa-solid');
    el.classList.toggle('fa-regular');
    // Отправляем запрос на сервер с помощью метода fetch, чтобы обновить статус понравившейся кошки
    fetch(`https://cats.petiteweb.dev/api/single/${name}/update/${id}`, {
        method: 'put', headers: {
            'Content-Type': 'application/json',
        }, body: JSON.stringify({ favorite: el.classList.contains('fa-solid') }),
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);// Выводим полученные данные в консоль

           
            if (data.message.includes('успешно')) {
                cats = cats.map(cat => {
                    if (cat.id === id) {
                        cat.favorite = el.classList.contains('fa-solid');
                    }
                    return cat;
                });
                localStorage.setItem('band-cats', JSON.stringify(cats));
            }
        }); // Если сервер вернул сообщение об успешном обновлении, 
        //обновляем локальный массив кошек и сохраняем его в localStorage
}


//Создаём рейтинг звёзд
function setRate(n) {
    let html = '';// Создаем пустую строку HTML
    // Создаем n иконок звезд с классом fa-solid
    for (let i = 0; i < n; i++) {
        html += '<i class="fa-solid fa-star"></i>';
    }
    // Добавляем оставшиеся (5-n) иконок
    for (let i = n; i < 5; i++) {
        html += '<i class="fa-regular fa-star"></i>';
    }
    return html;// Возвращаем строку HTML, представляющую рейтинг
}
// РАзбираемся с возростом котов
function setAge(n) {
    if (n % 100 < 11 || n % 100 > 14) {// Проверяем, не находится ли число в интервале от 11 до 14
        if (n % 10 === 1) {// Если число заканчивается на 1, возвращаем год
            return n + ' год';
        } else if (n % 10 >= 2 && n % 10 <= 4) {// Если число заканчивается на 2, 3 или 4, возвращаем года
            return n + ' года';
        }
        return n + ' лет';//Если число заканчивается на любую другую цифру, возвращаем лет
    }
    return n + ' лет';// Если число находится в интервале от 11 до 14, возвращаем лет
}
// Модальное окно инфа о коте
function showModal(id, el) {
    let m = Array.from(modals).find(m => m.dataset.type === el.dataset.action);//объявляем переменную m,
    // в которую сохраняем модальное окно из списка modals, 
    //соответствующее действию, указанному в атрибуте data-action кнопки el,
    // на которую был совершен клик

    m.classList.add('active');//добавляем класс active к найденному модальному окну,
    // чтобы отобразить его на экране

    let content = m.querySelector('.modal-cat');//объявляем переменную content,
    // в которую сохраняем элемент с классом modal-cat внутри модального окна m

    let cat = cats.find(cat => cat.id === id);//объявляем переменную cat, 
    //в которую сохраняем объект кота из массива cats,
    // у которого id соответствует переданному id
    
    //устанавливаем содержимое элемента content,
    // вставляя HTML-разметку с информацией о коте, полученной из объекта cat
    content.innerHTML = `
        <div class="cat-text">
            <h2>${cat.name}</h2>
            <div>${typeof cat.age === 'number' ? setAge(cat.age) : 'Возраст не указан'}</div>
            <div>${cat.description || 'Информации о котике пока нет...'}</div>
            <div class="edit-button-wrapper">
                <button class="btn">
                    <i class="fa-solid fa-pen" onclick="setUpd(${cat.id}, this)" data-action="upd"></i>
                </button>
            </div>
            
        </div>
        <img src=${cat.image || 'images/default.png'} alt="${cat.name}">
    `;
}

//Модалка для редактирования инфы о коте
function setUpd(id, el) {
    document.getElementById('modal-update').classList.add('active');//получаем элемент модального окна
    // с помощью getElementById и добавляем ему класс active, чтобы сделать его видимым
    let cat = cats.find(cat => cat.id === id);//находим кота, который будет редактироваться,
    // используя его id
    console.log(cat);
    for (let i = 0; i < updForm.elements.length; i++) { //начинаем цикл, чтобы перебрать 
        //все элементы формы для редактирования
        let inp = updForm.elements[i];// получаем текущий элемент формы в каждой итерации цикла
        if (inp.name && cat[inp.name]) {// проверяем, есть ли у элемента имя и соответствующее ему
            // значение у кота, чтобы заполнить элемент информацией о коте
            if (inp.type === 'checkbox') {// если элемент является чекбоксом, то устанавливаем его значение,
                // соответствующее значению в объекте кота
                inp.checked = cat[inp.name];
            } else {
                inp.value = cat[inp.name];// для остальных элементов устанавливаем значение,
                // соответствующее значению в объекте кота
            }
        }
    }
}

//Функция удаления карточки

function setDel(id, el) { // Находим карточку кота, которую нужно удалить по id
    let card = el.parentElement.parentElement; // // Отправляем DELETE запрос на сервер, чтобы удалить кота с указанным id
    fetch(`https://cats.petiteweb.dev/api/single/${name}/delete/${id}`, {
        method: 'delete',
    })
    // Получаем ответ от сервера в формате JSON
        .then(res => res.json())
        .then(data => {
            console.log(data);
            // Если удаление прошло успешно, то удаляем кота из массива и из локального хранилища
            // и удаляем его карточку с страницы
            if (data.message.includes('успешно')) {
                cats = cats.filter(cat => cat.id !== id); // Удаляем кота из массива
                localStorage.setItem('band-cats', JSON.stringify(cats));// Обновляем локальное хранилище
                card.remove();// Удаляем карточку с страницы
            } else { // Если удаление не удалось, то выводим сообщение об ошибке
                alert(data.message);
            }
        });
}

// Функция создания карточки кота. Принимаем объект obj (инфа о коте(id,лайк,изоброжение кота,имя кота,рэйтинг,описание кота,кнопки удалить изменить и т.д.))
function createCard(obj) {
    return `
        <div class="cat" data-id="${obj.id}">
            <i class="${obj.favorite ? 'fa-solid' : 'fa-regular'} fa-heart cat-like" onclick="setLike(${obj.id},this)"></i>
            <div class="cat-pic" style="background-image: url('${obj.image || 'images/default.png'}')"></div>
            <h2 class="cat-name">${obj.name}</h2>
            <div class="cat-rate">
                ${setRate(obj.rate || 0)}
            </div>
            <div class="cat-info">
                <button class="btn-text" onclick="showModal(${obj.id}, this)" data-action="show">Посмотреть</button>
                <button class="btn">
                    <i class="fa-solid fa-pen" onclick="setUpd(${obj.id}, this)" data-action="upd"></i>
                </button>
                <button class="btn" onclick="setDel(${obj.id}, this)">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

//проверяем, есть ли объекты котов в массиве cats. Если его длина равна 0,
// то вызывается функция getAllCats(), которая загружает данные с сервера

if (!cats.length) {
    getAllCats();
} else {
    container.innerHTML = '';
    cats.forEach(cat => {
        container.innerHTML += createCard(cat);
    });
}
// добавляет обработчик события submit на форму с идентификатором updForm
updForm.addEventListener('submit', (e) => {
    e.preventDefault();// отменяем стандартное поведение браузера для отправки формы
    let body = {};
    for (let i = 0; i < updForm.elements.length; i++) { // создаем цикл, который перебирает все элементы формы
        let inp = updForm.elements[i]; // объявляем переменную inp и присваивает ей текущий элемент формы
        if (inp.name) { //проверяем, есть ли у элемента атрибут name
            if (inp.type === 'checkbox') { //проверяет, является ли тип элемента checkbox
                body[inp.name] = inp.checked;// добавляет в объект body свойство с именем атрибута name
                // текущего элемента и значением равным состоянию (отмечен/не отмечен) текущего элемента
            } else { //выполняется в случае, если текущий элемент не является checkbox
                body[inp.name] = inp.value; //добавляем в объект body свойство с именем
                // атрибута name текущего элемента и значением равным его значению
            }
        }
    }

//обрабатываем событие отправки формы с обновлением данных о коте

    body.id = +body.id;// приводим значение id из формы к числу и сохраняем его в объект body
    console.log('upd', body);// вывод объекта body в консоль с пометкой upd
    fetch(`https://cats.petiteweb.dev/api/single/${name}/update/${body.id}`, {//выполненяем запроса на сервер
        method: 'put', headers: {
            'Content-Type': 'application/json',
        }, body: JSON.stringify(body),
    })
        .then(res => res.json())// преобразуем ответ сервера в формат JSON
        .then(data => {
            console.log(data);
            if (data.message.includes('успешно')) {// проверка сообщения от сервера на наличие слова "успешно"
                cats = cats.map(cat => {//  изменение массива cats, используя метод map
                    if (cat.id === body.id) {// если идентификатор кота равен идентификатору из формы, 
                        //то возвращается объект body
                        return body;// 
                    }
                    return cat;//возвращение неизмененного объекта cat
                });
                console.log(cats);
                container.innerHTML = '';// очистка содержимого контейнера, где хранятся карточки котов.
                cats.forEach(cat => {
                    container.innerHTML += createCard(cat);//создание карточек котов и добавление их в контейнер
                });
                updForm.reset();// сброс формы редактирования
                localStorage.setItem('band-cats', JSON.stringify(cats));// обновление данных в локальном хранилище
                document.getElementById('modal-update').classList.remove('active');// закрытие модального окна редактирования
            } else {
                alert(data.message);//неудачное обновление данных, выводим сообщение с ошибкой
            }
        });
});

// обработчик событий "submit" на форму "addForm"
addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let body = {};
    for (let i = 0; i < addForm.elements.length; i++) {
        let inp = addForm.elements[i];
        if (inp.name) {
            if (inp.type === 'checkbox') {
                body[inp.name] = inp.checked;
            } else {
                body[inp.name] = inp.value;
            }
        }
    }
    body.id = +body.id;
    console.log('add', body);
    fetch(`https://cats.petiteweb.dev/api/single/${name}/add`, {
        method: 'post', headers: {
            'Content-Type': 'application/json',
        }, body: JSON.stringify(body),
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data.message.includes('успешно')) {
                cats.push(body);
                container.innerHTML = '';
                cats.forEach(cat => {
                    container.innerHTML += createCard(cat);
                });
                addForm.reset();
                localStorage.setItem('band-cats', JSON.stringify(cats));
                Array.from(modals).find(m => m.dataset.type === 'add').classList.remove('active');
            } else {
                alert(data.message);
            }
        });
});


