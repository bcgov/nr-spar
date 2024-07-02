import React, { useContext } from 'react';
import {
  Row, Column, TextInput, TextInputSkeleton
} from '@carbon/react';

import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import { PLACE_HOLDER } from '../../../shared-constants/shared-constants';

type UnrelatedGenWorthProps = {
  validGenWorth: Array<string>;
  isRead?: boolean;
}

const UnrelatedGenWorth = ({ isRead, validGenWorth }: UnrelatedGenWorthProps) => {
  const {
    isCalculatingPt, genWorthVals, setGenWorthVal
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
        {
          !validGenWorth.includes('ad')
            ? (
              <Column className="info-col" sm={4} md={4} lg={4}>
                {
                  isCalculatingPt
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
            )
            : null
        }
        {
          !validGenWorth.includes('dfs')
            ? (
              <Column className="info-col" sm={4} md={4} lg={4}>
                {
                  isCalculatingPt
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
            )
            : null
        }
        {
          !validGenWorth.includes('dfu')
            ? (
              <Column className="info-col" sm={4} md={4} lg={4}>
                {
                  isCalculatingPt
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
            )
            : null
        }
        {
          !validGenWorth.includes('dfw')
            ? (
              <Column className="info-col" sm={4} md={4} lg={4}>
                {
                  isCalculatingPt
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
            )
            : null
        }
      </Row>

      <Row>
        {
          !validGenWorth.includes('dsb')
            ? (
              <Column className="info-col" sm={4} md={4} lg={4}>
                {
                  isCalculatingPt
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
            )
            : null
        }
        {
          !validGenWorth.includes('dsc')
            ? (
              <Column className="info-col" sm={4} md={4} lg={4}>
                {
                  isCalculatingPt
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
            )
            : null
        }
        {
          !validGenWorth.includes('dsg')
            ? (
              <Column className="info-col" sm={4} md={4} lg={4}>
                {
                  isCalculatingPt
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
            )
            : null
        }
        {
          !validGenWorth.includes('gvo')
            ? (
              <Column className="info-col" sm={4} md={4} lg={4}>
                {
                  isCalculatingPt
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
            )
            : null
        }
      </Row>

      <Row>
        {
          !validGenWorth.includes('iws')
            ? (
              <Column className="info-col" sm={4} md={4} lg={4}>
                {
                  isCalculatingPt
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
            )
            : null
        }
        {
          !validGenWorth.includes('wdu')
            ? (
              <Column className="info-col" sm={4} md={4} lg={4}>
                {
                  isCalculatingPt
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
            )
            : null
        }
        {
          !validGenWorth.includes('wve')
            ? (
              <Column className="info-col" sm={4} md={4} lg={4}>
                {
                  isCalculatingPt
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
            )
            : null
        }
        {
          !validGenWorth.includes('wwd')
            ? (
              <Column className="info-col" sm={4} md={4} lg={4}>
                {
                  isCalculatingPt
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
            )
            : null
        }
      </Row>
    </>
  );
};

export default UnrelatedGenWorth;
