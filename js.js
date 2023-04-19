function throttle(func, ms) {

    let isThrottled = false,
        savedArgs,
        savedThis;

    function wrapper() {

        if (isThrottled) {
            savedArgs = arguments;
            savedThis = this;
            return;
        }

        func.apply(this, arguments);

        isThrottled = true;

        setTimeout(function () {
            isThrottled = false;
            if (savedArgs) {
                wrapper.apply(savedThis, savedArgs);
                savedArgs = savedThis = null;
            }
        }, ms);
    }

    return wrapper;
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
        const throtled = throttle(this.processSearch, 2000);
        this.input.addEventListener("keyup", throtled.bind(this));
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
        const response = await fetch(`https://api.github.com/search/repositories?q=${search}`);
        if (response.ok) {
            const json = await response.json();
            return json.items.slice(0, 5);
        } else {
            return [];
        }
    }

    async processSearch() {
        const search = this.input.value;
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
