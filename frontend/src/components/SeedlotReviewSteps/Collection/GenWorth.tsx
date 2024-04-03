import React, { useContext } from 'react';
import {
  Row, Column, TextInput, TextInputSkeleton
} from '@carbon/react';

import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';

import { PLACE_HOLDER } from './constants';

type props = {
  isRead?: boolean;
}

const GenWorth = ({ isRead }: props) => {
  const {
    isFetchingData, genWorthVals, setGenWorthVal
  } = useContext(ClassAContext);

  const formatGenWorthVals = (value: string) => {
    if (!value.length && isRead) {
      return PLACE_HOLDER;
    }

    let formatted = Number(value).toFixed(2);
    if (isRead) {
      if (Number(value) >= 0) {
        formatted = `+ ${formatted}`;
      } else {
        formatted = `- ${formatted}`;
      }
    }

    return formatted;
  };

  return (
    <>
      <Row>
        <Column className="sub-section-title-col">
          Genetic worth
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          {
            isFetchingData
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id="gen-worth-ad"
                  labelText="Deer browse (AD)"
                  defaultValue={formatGenWorthVals(genWorthVals.ad.value)}
                  readOnly={isRead}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGenWorthVal('ad', e.target.value);
                  }}
                />
              )
          }
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          {
            isFetchingData
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id="gen-worth-dfs"
                  labelText="Dothistroma needle blight (DFS):"
                  defaultValue={formatGenWorthVals(genWorthVals.dfs.value)}
                  readOnly={isRead}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGenWorthVal('dfs', e.target.value);
                  }}
                />
              )
          }
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          {
            isFetchingData
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id="gen-worth-dfu"
                  labelText="Cedar leaf blight (DFU):"
                  defaultValue={formatGenWorthVals(genWorthVals.dfu.value)}
                  readOnly={isRead}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGenWorthVal('dfu', e.target.value);
                  }}
                />
              )
          }
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          {
            isFetchingData
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id="gen-worth-dfw"
                  labelText="Swiss needle cast (DFW):"
                  defaultValue={formatGenWorthVals(genWorthVals.dfw.value)}
                  readOnly={isRead}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGenWorthVal('dfw', e.target.value);
                  }}
                />
              )
          }
        </Column>
      </Row>

      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          {
            isFetchingData
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id="gen-worth-dsb"
                  labelText="White pine blister rust (DSB):"
                  defaultValue={formatGenWorthVals(genWorthVals.dsb.value)}
                  readOnly={isRead}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGenWorthVal('dsb', e.target.value);
                  }}
                />
              )
          }
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          {
            isFetchingData
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id="gen-worth-dsc"
                  labelText="Comandra blister rust (DSC):"
                  defaultValue={formatGenWorthVals(genWorthVals.dsc.value)}
                  readOnly={isRead}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGenWorthVal('dsc', e.target.value);
                  }}
                />
              )
          }
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          {
            isFetchingData
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id="gen-worth-dsg"
                  labelText="Western gall rust (DSG):"
                  defaultValue={formatGenWorthVals(genWorthVals.dsg.value)}
                  readOnly={isRead}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGenWorthVal('dsg', e.target.value);
                  }}
                />
              )
          }
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          {
            isFetchingData
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id="gen-worth-gvo"
                  labelText="Volume growth(GVO):"
                  defaultValue={formatGenWorthVals(genWorthVals.gvo.value)}
                  readOnly={isRead}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGenWorthVal('gvo', e.target.value);
                  }}
                />
              )
          }
        </Column>
      </Row>

      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          {
            isFetchingData
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id="gen-worth-iws"
                  labelText="White pine terminal weevil (IWS):"
                  defaultValue={formatGenWorthVals(genWorthVals.iws.value)}
                  readOnly={isRead}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGenWorthVal('iws', e.target.value);
                  }}
                />
              )
          }
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          {
            isFetchingData
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id="gen-worth-wdu"
                  labelText="Durability (WDU):"
                  defaultValue={formatGenWorthVals(genWorthVals.wdu.value)}
                  readOnly={isRead}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGenWorthVal('wdu', e.target.value);
                  }}
                />
              )
          }
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          {
            isFetchingData
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id="gen-worth-wve"
                  labelText="Wood velocity measures (WVE):"
                  defaultValue={formatGenWorthVals(genWorthVals.wve.value)}
                  readOnly={isRead}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGenWorthVal('wve', e.target.value);
                  }}
                />
              )
          }
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          {
            isFetchingData
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id="gen-worth-wwd"
                  labelText="Wood density (WWD):"
                  defaultValue={formatGenWorthVals(genWorthVals.wwd.value)}
                  readOnly={isRead}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGenWorthVal('wwd', e.target.value);
                  }}
                />
              )
          }
        </Column>
      </Row>
    </>
  );
};

export default GenWorth;
