import React from 'react';

const NavBar = () => {
    return (
        <div className="Buttons">
            <div className="NavBarButtons">
                <svg className="HomeIcon" xmlns="http://www.w3.org/2000/svg" width="23" height="24" viewBox="0 0 23 24" fill="none">
                    <path d="M11.4702 0.000446666C11.2747 0.00716809 11.0865 0.0766571 10.9331 0.19876L2.2474 7.08926C1.14501 7.96409 0.5 9.30089 0.5 10.7142V22.4616C0.5 23.3007 1.19447 24 2.02778 24H8.13889C8.9722 24 9.66667 23.3007 9.66667 22.4616V16.3078C9.66667 16.1263 9.79192 16.0002 9.97222 16.0002H13.0278C13.2081 16.0002 13.3333 16.1263 13.3333 16.3078V22.4616C13.3333 23.3007 14.0278 24 14.8611 24H20.9722C21.8055 24 22.5 23.3007 22.5 22.4616V10.7142C22.5 9.30089 21.855 7.96409 20.7526 7.08926L12.0669 0.19876C11.8974 0.0639168 11.6861 -0.00631706 11.4702 0.000446666ZM11.5 2.09897L19.6187 8.53995C20.2812 9.06571 20.6667 9.86538 20.6667 10.7142V22.1539H15.1667V16.3078C15.1667 15.1294 14.198 14.154 13.0278 14.154H9.97222C8.80197 14.154 7.83333 15.1294 7.83333 16.3078V22.1539H2.33333V10.7142C2.33333 9.86538 2.71879 9.06571 3.38129 8.53995L11.5 2.09897Z" fill="#898989" />
                </svg>
                Home
            </div>
            <div className="NavBarButtons">
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                    <path d="M12.5 23.6006L11.5372 23.8709L12.5 23.6006L11.9963 21.8063C10.7707 17.441 7.35931 14.0296 2.99397 12.804L1.19971 12.3003L0.929416 11.3375L1.19971 12.3003L2.99398 11.7966C7.35932 10.571 10.7708 7.15961 11.9963 2.79427L12.5 0.999998L13.0037 2.79427C14.2293 7.15961 17.6407 10.571 22.0061 11.7966L23.8003 12.3003L22.0061 12.804C17.6407 14.0296 14.2293 17.441 13.0037 21.8064L12.5 23.6006Z" stroke="#898989" strokeWidth="2" />
                </svg>
                Discover
            </div>
            <div className="NavBarButtons">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M16.9056 16.7826C18.4432 15.2141 19.3913 13.0656 19.3913 10.6957C19.3913 5.89318 15.4981 2 10.6957 2C5.89318 2 2 5.89318 2 10.6957C2 15.4981 5.89318 19.3913 10.6957 19.3913C13.1282 19.3913 15.3274 18.3925 16.9056 16.7826ZM16.9056 16.7826L22 22" stroke="#898989" strokeWidth="2.02054" strokeLinecap="round" />
                </svg>
                Search
            </div>
            <div className="NavBarButtons">
                <svg className="LibraryIcon" xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                    <path d="M1.85669 2V19.2868M7.619 2V19.2868M13.3813 2V19.2868H19.1435V5.98927L13.3813 2Z" stroke="#898989" strokeWidth="2.02054" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Library
            </div>
            <div className="NavBarButtons">
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="22" viewBox="0 0 19 22" fill="none">
                    <path d="M12.8676 5.36757C12.8676 7.22742 11.3598 8.73514 9.49999 8.73514C7.64014 8.73514 6.13243 7.22742 6.13243 5.36757C6.13243 3.50771 7.64014 2 9.49999 2C11.3598 2 12.8676 3.50771 12.8676 5.36757Z" stroke="#898989" strokeWidth="2.02054" strokeLinecap="round" />
                    <path d="M2.58063 14.4706L3.33042 13.9707C5.15746 12.7527 7.30415 12.1027 9.49997 12.1027C11.6958 12.1027 13.8425 12.7527 15.6695 13.9707L16.4193 14.4706C17.3562 15.0952 17.9189 16.1466 17.9189 17.2726V18.9501C17.9189 19.8181 17.2153 20.5217 16.3474 20.5217H2.65259C1.78465 20.5217 1.08105 19.8181 1.08105 18.9501V17.2726C1.08105 16.1466 1.64378 15.0952 2.58063 14.4706Z" stroke="#898989" strokeWidth="2.02054" strokeLinecap="round" />
                </svg>
                Profile
            </div>
        </div>
    );
};

export default NavBar;