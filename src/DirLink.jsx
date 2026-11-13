import { useRef } from 'react';

// Сторона, с которой курсор вошёл в элемент / вышел из него
const edge = (e, el) => {
  const r = el.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  const d = [
    [x, 'l'],
    [r.width - x, 'r'],
    [y, 't'],
    [r.height - y, 'b']
  ];
  d.sort((a, b) => a[0] - b[0]);
  return d[0][1];
};

const OFF = {
  l: 'translate3d(-101%,0,0)',
  r: 'translate3d(101%,0,0)',
  t: 'translate3d(0,-101%,0)',
  b: 'translate3d(0,101%,0)'
};

// Ссылка с direction-aware hover: заливка «заезжает» с той стороны,
// с которой пришёл курсор, и «уезжает» в ту сторону, куда он ушёл.
export default function DirLink({
  as: Tag = 'a',
  className = '',
  children,
  onMouseEnter,
  onMouseLeave,
  ...rest
}) {
  const fill = useRef(null);

  const enter = e => {
    const f = fill.current;
    if (f) {
      f.style.transition = 'none';
      f.style.transform = OFF[edge(e, e.currentTarget)];
      void f.offsetWidth; // перезапуск transition
      f.style.transition = '';
      f.style.transform = 'translate3d(0,0,0)';
    }
    onMouseEnter && onMouseEnter(e);
  };

  const leave = e => {
    const f = fill.current;
    if (f) f.style.transform = OFF[edge(e, e.currentTarget)];
    onMouseLeave && onMouseLeave(e);
  };

  return (
    <Tag
      {...rest}
      className={('dh ' + className).trim()}
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      <span className="dh-fill" ref={fill} aria-hidden="true" />
      {children}
    </Tag>
  );
}
