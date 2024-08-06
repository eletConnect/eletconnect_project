import React from 'react';
import MHeader from '../../../components/mheader';
import MFooter from '../../../components/mfooter';
import "../../../assets/styles/mMain.css";

export default function MHome() {

    return (
        <>
            <MHeader />
            <main id='mMain'>
                <div id="carouselExample" className="carousel slide" data-bs-ride="carousel">
                    <div className="carousel-inner">
                        <div className="carousel-item active text-center">
                            <p>Batata</p>
                        </div>
                        <div className="carousel-item text-center">
                            <p>Beterraba</p>
                        </div>
                        <div className="carousel-item text-center">
                            <p>Mandioca</p>
                        </div>
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon bg-black" aria-hidden="true"></span>
                        <span className="visually-hidden ">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
                        <span className="carousel-control-next-icon bg-black" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                    </button>
                </div>
            </main>
            <MFooter />
        </>
    );
}
