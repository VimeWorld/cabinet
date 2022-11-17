const OuterPage = ({ children, background = 'bg-gradient-blue' }) => {
    return <section className={background}>
        <div className="container min-vh-100">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="card w-100 p-4 my-5">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    </section>
}

export default OuterPage
