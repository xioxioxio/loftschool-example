VK.init({
    apiId: 6488362
});

function auth() {
    return new Promise((resolve, reject) => {
        VK.Auth.login(data => {
            if (data.session) {
                resolve();
            } else {
                reject(new Error('Auth error'));
            }
        }, 2);
    });
}

function callAPI(method, params) {
    params.v = '5.8';

    return new Promise((resolve, reject) => {
        VK.api(method, params, (data) => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data.response);
            }
        });
    });
}

function generateList(friendsObj) {
    const template = '{{#each items}}<div id="{{id}}" class="row" draggable="true"><img class="vk-img" src="{{photo_100}}" /><div id="text" class="padding">{{first_name}} {{last_name}}</div><button class="row-button">+</button></div>{{/each}}';
    const render = Handlebars.compile(template);

    return render(friendsObj);
}

function filterElement(item, filterStr) {
    if (!item.firstElementChild.nextElementSibling.innerText.toLowerCase().includes(filterStr.toLowerCase())) {
        item.style.display = 'none';
    } else {
        item.style.display = 'flex';
    }   
}

const vkList = document.getElementById('vk-list');
const saveList = document.getElementById('selected-list');
const saveButton = document.getElementById('save-button');
const vkFilter = document.getElementById('vk-filter');
const savedFilter = document.getElementById('saved-filter');

saveButton.onclick = () => {
    let arr = [...saveList.getElementsByClassName('row')].map((item) => item.id);

    localStorage.setItem('savedList', JSON.stringify(arr));
}

vkList.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('dragData', e.target.id);
});

saveList.addEventListener('dragover', (e) => {
    e.preventDefault();

    return false;
});

saveList.addEventListener('drop', (e) => {
    let dragId = e.dataTransfer.getData('dragData');
    let row = document.getElementById(dragId);
    let button = row.getElementsByTagName('button')[0];

    button.innerText = 'x';
    row.setAttribute('draggable', 'false');
    saveList.appendChild(row);
});

vkFilter.addEventListener('keyup', () => {
    [...vkList.children].forEach((item) => {
        filterElement(item, vkFilter.value);
    });
});

savedFilter.addEventListener('keyup', () => {
    [...saveList.children].forEach((item) => {
        filterElement(item, savedFilter.value);
    });
});

auth()
    .then(() => callAPI('friends.get', { fields: 'photo_100' }))
    .then(friends => {
        const html = generateList(friends);
        
        vkList.innerHTML = html;
    })
    .then(() => {
        [...vkList.getElementsByClassName('row-button')].forEach((item) => {
            item.onclick = () => {
                if (item.innerText === '+') {
                    item.innerText = 'x';
                    saveList.appendChild(item.parentElement);
                } else {
                    item.innerText = '+';
                    vkList.appendChild(item.parentElement);
                }
            };
        });
    })
    .then(() => {
        let savedItems = JSON.parse(localStorage.getItem('savedList'));

        savedItems.forEach(item => {
            let row = document.getElementById(item);
            let button = row.getElementsByTagName('button')[0];

            button.innerText = 'x';
            saveList.appendChild(row);
        });
    });