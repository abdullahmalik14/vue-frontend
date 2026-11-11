import { reactive } from 'vue';

const state = reactive({
  mobile: false,
  tablet: false,
  desktop: false
});

const mobileQuery = window.matchMedia('(max-width: 767px)');
const tabletQuery = window.matchMedia('(min-width: 768px) and (max-width: 1023px)');
const desktopQuery = window.matchMedia('(min-width: 1024px)');

const update = () => {
  state.mobile = mobileQuery.matches;
  state.tablet = tabletQuery.matches;
  state.desktop = desktopQuery.matches;
};

function attachMediaQueryListener(query, fn) {
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', fn);
  } else if (typeof query.addListener === 'function') {
    query.addListener(fn);
  }
}

attachMediaQueryListener(mobileQuery, update);
attachMediaQueryListener(tabletQuery, update);
attachMediaQueryListener(desktopQuery, update);

// initialize
update();

export default {
  state
};
