// Explain: JavaScript for interactive elements like mobile menu, forms, and filtering.
document.addEventListener('DOMContentLoaded', function () {
    function setStatus(element, message, isError) {
        if (!element) {
            return;
        }
        element.textContent = message;
        element.classList.remove('text-[var(--accent-color)]', 'text-[var(--secondary-color)]');
        element.classList.add(isError ? 'text-[var(--accent-color)]' : 'text-[var(--secondary-color)]');
    }

    function lockButton(form, locked) {
        var button = form.querySelector('button[type="submit"]');
        if (!button) {
            return;
        }
        button.disabled = locked;
        button.classList.toggle('opacity-70', locked);
    }

    function wireSubscribe(formId, statusId, sourceLabel) {
        var form = document.getElementById(formId);
        var status = document.getElementById(statusId);
        if (!form) {
            return;
        }
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!window.MessagesSystem) {
                setStatus(status, 'Форма временно недоступна. Попробуйте через минуту.', true);
                return;
            }
            var emailInput = form.querySelector('input[type="email"]');
            var email = emailInput ? emailInput.value.trim() : '';
            if (!email) {
                setStatus(status, 'Укажите электронную почту.', true);
                return;
            }
            lockButton(form, true);
            window.MessagesSystem.submit([
                { label: 'Источник подписки', value: sourceLabel, type: 'text' },
                { label: 'Электронная почта', value: email, type: 'email' }
            ], form).then(function (response) {
                if (response && response.success) {
                    form.reset();
                    setStatus(status, 'Готово — адрес добавлен в список рассылки.', false);
                } else {
                    setStatus(status, (response && response.error) ? response.error : 'Не удалось отправить. Попробуйте ещё раз.', true);
                }
            }).catch(function () {
                setStatus(status, 'Не удалось отправить. Проверьте соединение и повторите.', true);
            }).then(function () {
                lockButton(form, false);
            });
        });
    }

    wireSubscribe('newsletterFooterForm', 'newsletterFooterStatus', 'Подписка в подвале сайта');

    var contactForm = document.getElementById('contactForm');
    var contactStatus = document.getElementById('contactStatus');
    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!window.MessagesSystem) {
                setStatus(contactStatus, 'Форма временно недоступна. Попробуйте через минуту.', true);
                return;
            }
            var nameValue = contactForm.elements['name'] ? contactForm.elements['name'].value.trim() : '';
            var emailValue = contactForm.elements['email'] ? contactForm.elements['email'].value.trim() : '';
            var topicValue = contactForm.elements['topic'] ? contactForm.elements['topic'].value : '';
            var messageValue = contactForm.elements['message'] ? contactForm.elements['message'].value.trim() : '';
            if (!emailValue || !messageValue) {
                setStatus(contactStatus, 'Заполните почту и текст сообщения.', true);
                return;
            }
            lockButton(contactForm, true);
            window.MessagesSystem.submit([
                { label: 'Имя', value: nameValue, type: 'text' },
                { label: 'Электронная почта', value: emailValue, type: 'email' },
                { label: 'Тема', value: topicValue, type: 'select' },
                { label: 'Сообщение', value: messageValue, type: 'textarea' }
            ], contactForm).then(function (response) {
                if (response && response.success) {
                    contactForm.reset();
                    setStatus(contactStatus, 'Спасибо! Сообщение отправлено — ответим в течение двух рабочих дней.', false);
                } else {
                    setStatus(contactStatus, (response && response.error) ? response.error : 'Не удалось отправить сообщение.', true);
                }
            }).catch(function () {
                setStatus(contactStatus, 'Не удалось отправить сообщение. Проверьте соединение.', true);
            }).then(function () {
                lockButton(contactForm, false);
            });
        });
    }

    var menuButton = document.getElementById('menuToggle');
    var mobileMenu = document.getElementById('mobileMenu');
    if (menuButton && mobileMenu) {
        var closeMenu = function () {
            mobileMenu.classList.remove('is-open');
            menuButton.setAttribute('aria-expanded', 'false');
        };
        menuButton.addEventListener('click', function (event) {
            event.stopPropagation();
            var isOpen = mobileMenu.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
        mobileMenu.addEventListener('click', function (event) {
            if (event.target.closest('a')) {
                closeMenu();
            }
        });
        document.addEventListener('click', function (event) {
            if (!mobileMenu.contains(event.target) && !menuButton.contains(event.target)) {
                closeMenu();
            }
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeMenu();
            }
        });
    }

    var filterWrap = document.getElementById('articleFilter');
    var articleGrid = document.getElementById('articleGrid');
    var articleEmpty = document.getElementById('articleEmpty');
    if (filterWrap && articleGrid) {
        var filterButtons = filterWrap.querySelectorAll('.category-filter-btn');
        filterWrap.addEventListener('click', function (event) {
            var button = event.target.closest('.category-filter-btn');
            if (!button) {
                return;
            }
            var filterValue = button.getAttribute('data-filter');
            filterButtons.forEach(function (item) {
                item.classList.remove('is-active');
            });
            button.classList.add('is-active');
            var cards = articleGrid.querySelectorAll('[data-category]');
            var visibleCount = 0;
            cards.forEach(function (card) {
                var matches = filterValue === 'Все' || card.getAttribute('data-category') === filterValue;
                card.classList.toggle('is-hidden', !matches);
                if (matches) {
                    visibleCount += 1;
                }
            });
            if (articleEmpty) {
                articleEmpty.classList.toggle('is-hidden', visibleCount !== 0);
            }
        });
    }
});