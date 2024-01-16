import React from 'react';
import { Link } from 'react-router-dom';
import PathConstants from '../../routes/pathConstants';

import mysteryImg from '../../assets/img/404-mystery.png';

import './styles.scss';

const FourOhFour = () => {
  type linkType = {
    href: string,
    text: string
  }

  const links: linkType[] = [
    {
      href: PathConstants.DASHBOARD,
      text: 'Dashboard'
    },
    {
      href: PathConstants.SEEDLOTS,
      text: 'Seedlots'
    }
  ];
  return (
    <div className="fof-container">
      <div className="fof-text">404</div>
      <img src={mysteryImg} alt="" />
      <div>
        <h1>
          Sorry, we can&apos;t find the page you are looking for.
        </h1>
        <h2>
          Maybe some of these most visited links will help you?
        </h2>
        <div className="list">
          {
            links.map(({ href, text }) => (
              <li key={text}>
                <Link className="link" to={href}>
                  <h3>{text}</h3>
                </Link>
              </li>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default FourOhFour;
