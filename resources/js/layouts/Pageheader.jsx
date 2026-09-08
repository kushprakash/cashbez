import React, { Fragment, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const Pageheader = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // Check if we have history to go back
    setCanGoBack(window.history.length > 1);
  }, [location]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <Fragment>
      <div className="d-md-flex d-block align-items-center justify-content-between page-header-breadcrumb">

        <div className="align-items-center d-flex">
          {props.mainheading !== "Dashboard" && (
            <button
              onClick={handleGoBack}
              className="btn btn-icon btn-outline-primary me-3 d-inline-flex align-items-center justify-content-center flex-shrink-0"
              title="Go Back"
              style={{ width: '36px', height: '36px', borderRadius: '50%', padding: 0 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
          )}
          <div>
            <h2 className="main-content-title fs-24 mb-1 text-dark">{props.mainheading}</h2>
            {props?.buttons && (<nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">{props.parentfolder}</li>
                <li className="breadcrumb-item active" aria-current="page">{props.activepage}</li>
              </ol>
            </nav>)}
          </div>
        </div>
        <div className="d-flex align-items-center">
          {props?.buttons ? props.buttons : (<>
            <nav aria-label="breadcrumb" className="me-3">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">{props.parentfolder}</li>
                <li className="breadcrumb-item active" aria-current="page">{props.activepage}</li>
              </ol>
            </nav>
          </>)}
          <div className="ms-3 d-flex align-items-center">
            <img 
              src="/assets/bharat-connect.PNG" 
              alt="Bharat Connect" 
              style={{ maxHeight: '40px', width: 'auto', objectFit: 'contain' }} 
            />
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default Pageheader;
