const toggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-site-nav]');
if (toggle && nav) {
  const mobileNav = window.matchMedia('(max-width: 44rem)');
  const resetNav = () => {
    const mobile = mobileNav.matches;
    nav.hidden = mobile;
    toggle.setAttribute('aria-expanded', 'false');
  };
  resetNav();
  mobileNav.addEventListener('change', resetNav);
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.hidden = open;
  });
}
document.querySelectorAll('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });
const searchForm=document.querySelector('[data-site-search]');
if(searchForm){const query=searchForm.querySelector('[data-site-search-query]'),status=document.querySelector('[data-search-status]'),results=document.querySelector('[data-search-results]');let index=[];fetch('/search-index.json').then(r=>r.json()).then(data=>{index=data});searchForm.addEventListener('submit',event=>{event.preventDefault();const needle=query.value.trim().toLocaleLowerCase();results.replaceChildren();if(!needle){status.textContent='Enter a word or phrase to search the public pages.';return}const matches=index.filter(item=>`${item.title} ${item.description} ${item.headings}`.toLocaleLowerCase().includes(needle));for(const item of matches){const li=document.createElement('li'),a=document.createElement('a');a.href=item.url;a.textContent=item.title;li.append(a);if(item.description){const p=document.createElement('p');p.textContent=item.description;li.append(p)}results.append(li)}status.textContent=`${matches.length} result${matches.length===1?'':'s'} found.`})}
