import React, { useContext } from 'react';
import { Row, Column } from '@carbon/react';
import StandardCard from '../Card/StandardCard';
import { cards } from './constants';
import './styles.scss';
import AuthContext from '../../contexts/AuthContext';

const SeedlotCards = () => {
  const { isTscAdmin } = useContext(AuthContext);

  return (
    <Row className="seedlot-activities-cards">
      {
        cards.filter((c) => c.displayForAdmin === isTscAdmin).map((card) => (
          <Column sm={4} md={4} lg={8} xlg={8} max={4} key={card.id}>
            <StandardCard
              image={card.image}
              header={card.header}
              description={card.description}
              url={card.link}
              isEmpty={card.isEmpty}
              emptyTitle={card.emptyTitle}
              emptyDescription={card.emptyDescription}
            />
          </Column>
        ))
      }
    </Row>
  );
};

export default SeedlotCards;
