const sidebarElementsArray = [
    {
        type: 'button',
        href: '/',
        name: 'Home',
        iconName: 'home'
    },
    {
        type: 'button',
        href: '/todos',
        name: 'Todo List',
        iconName: 'list-check'
    },
    // {
    //     type: 'button',
    //     href: '/timetable',
    //     name: 'Timetable',
    //     iconName: 'calendar-days'
    // },
    // {
    //     type: 'button',
    //     href: '/events',
    //     name: 'Events',
    //     iconName: 'calendar-star'
    // },
    // {
    //     type: 'button',
    //     href: '/flashcards',
    //     name: 'Flashcards',
    //     iconName: 'cards-blank'
    // },
    {
        type: 'hr'
    },
    {
        type: 'button',
        href: '/settings',
        name: 'Settings',
        iconName: 'settings'
    }
];

const currentHref = window.location.href;
const currentPath = window.location.pathname.replace('/sticker', '').split('/');
const currentPage = '/' + currentPath[1];
const onPages = window.location.hostname.includes('github');  // Used to automatically add /sticker to fix GitHub Pages links


const sidebarContainer = document.getElementById('sidebar-container');

sidebarElementsArray.forEach(element => {
    const sidebarElement = document.createElement(element.type);
    if (element.type === 'button') {
        const isCurrentPage = currentPage === element.href;

        sidebarElement.className = 'sidebar-button';
        sidebarElement.className += isCurrentPage ? ' current-sidebar-button' : '';
        sidebarElement.onclick = function () { document.location.href = onPages ? '/sticker' : '' + element.href; };

        sidebarElement.innerHTML = `
            <i class="fi fi-${isCurrentPage ? 's' : 'r'}r-${element.iconName}"></i>
            <span class="sidebar-button-tooltip">${element.name}</span>
        `;
    }

    sidebarContainer.appendChild(sidebarElement);
});