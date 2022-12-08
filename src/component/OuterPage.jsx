import useApp from '../hooks/useApp';

const OuterPage = ({ children, variant = 'blue' }) => {
  const { app } = useApp();

  let border = '';
  let background = '';
  if (app.theme === 'dark') {
    border = 'border border-' + (variant == 'red' ? 'danger' : 'primary');
  } else {
    background = variant == 'red' ? 'bg-gradient-red' : 'bg-gradient-blue';
  }

  return (
    <section className={background}>
      <div className="container min-vh-100">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="text-center fs-2 fw-bold mt-2">
              <a href="https://vimeworld.com" className="text-white text-decoration-none">
                VimeWorld
              </a>
            </div>
            <div className={'card w-100 p-4 mt-4 mb-5 ' + border}>{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OuterPage;
