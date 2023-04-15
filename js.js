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
                li.innerHTML = `<span class="select-item__name">${rep.full_name}</span>`;
                return li;
            })
            .forEach((li) => {
                ul.append(li);
            });

        this.dropdown.append(ul);
    }

    clearList() {
        this.dropdown.innerHTML = '';
    }

    createElement(elementName, className) {
        const element = document.createElement(elementName);
        if (className) {
            element.classList.add(className);
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
