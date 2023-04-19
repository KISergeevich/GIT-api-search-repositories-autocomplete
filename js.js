function debounce(func, timeout) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

class Select {
    constructor(selector, options) {
        this.$el = document.querySelector(selector);
        this.input = document.querySelector('.select__input');
        this.dropdown = document.querySelector('.select__dropdown');
        this.chosen = document.querySelector('.chosen-reps');

        this.setup();
    }

    setup() {
        const debounced = debounce(this.processSearch, 500);
        this.input.addEventListener("input", debounced.bind(this));
    }

    generateList(reps) {
        const ul = this.createElement('ul', 'select__list');
        reps
            .map((rep) => {
                const li = this.createElement('li', 'select__item');
                const span = this.createElement('span', 'select-item__name', rep.full_name);
                li.append(span);
                li.addEventListener('click', () => {
                    this.addPinkElement(rep.id, rep.name, rep.owner.login, rep.stargazers_count);
                    this.clearList();
                    this.input.value = '';
                })
                return li;
            })
            .forEach((li) => {
                ul.append(li);
            });

        this.dropdown.append(ul);
    }

    addPinkElement(id, name, owner, stars) {
        const li = this.createElement('li', 'chosen-rep');
        li.id = id;
        const info = this.createElement('div', 'chosen-rep__info');
        const repName = this.createElement('div', 'chosen-rep__name', `Name: ${name}`);
        const repOwner = this.createElement('div', 'chosen-rep__owner', `Owner: ${owner}`);
        const repStars = this.createElement('div', 'chosen-rep__stars', `Stars: ${stars}`);

        info.append(repName);
        info.append(repOwner);
        info.append(repStars);
        li.append(info);

        const deleteDiv = this.createElement('div', 'chosen-rep__delete');
        deleteDiv.addEventListener('click', () => {
            this.chosen.removeChild(li);
        })
        li.append(deleteDiv);
        this.chosen.append(li);
    }

    clearList() {
        this.dropdown.innerHTML = ''; //тут невозможна xss атака.
    }

    createElement(elementName, className, content) {
        const element = document.createElement(elementName);
        if (className) {
            element.classList.add(className);
        }
        if (content) {
            element.innerText = content;
        }
        return element;
    }
    async fetchReps(search) {
        const response = await fetch(`https://api.github.com/search/repositories?q=${search}&per_page=5`);
        if (response.ok) {
            const json = await response.json();
            return json.items;
        } else {
            return [];
        }
    }

    async processSearch(event) {
        const search = event.target.value;
        this.clearList();
        if (search !== undefined && search !== "") {
            const result = await this.fetchReps(search);
            this.generateList(result);
        }
        this.open();
    }

    open() {
        this.dropdown.classList.add('select__dropdown--open');
    }

    close() {
        this.dropdown.classList.remove('select__dropdown--open');
    }
}

const select = new Select('.select');
