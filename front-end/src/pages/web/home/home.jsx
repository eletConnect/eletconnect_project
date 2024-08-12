import Header from "../../../components/header";
import React, { useEffect } from 'react';

export default function Home() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    useEffect(() => {
        if (!user) {
            window.location.href = '/verification';
        }
    }, [user]);

    return (
        <>
            <Header />
            <section id='section'>
                <div className="box">
 
                </div>
            </section>
        </>
    );
}
