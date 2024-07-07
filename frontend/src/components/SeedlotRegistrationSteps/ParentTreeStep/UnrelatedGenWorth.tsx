import React, { useContext } from 'react';
import {
  Row, Column, TextInput
} from '@carbon/react';

import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import ReadOnlyInput from '../../ReadOnlyInput';

type UnrelatedGenWorthProps = {
  validGenWorth: Array<string>;
  isRead?: boolean;
}

const UnrelatedGenWorth = ({ isRead, validGenWorth }: UnrelatedGenWorthProps) => {
  const {
    isCalculatingPt, genWorthVals, setGenWorthVal
  } = useContext(ClassAContext);

  return (
    <Row>
      {
        !validGenWorth.includes('ad')
          ? (
            <Column className="info-col" sm={4} md={4} lg={4}>
              {
                isRead
                  ? (
                    <ReadOnlyInput
                      id="gen-worth-ad-readonly"
                      label="Deer browse (AD)"
                      value={genWorthVals.ad.value}
                      showSkeleton={isCalculatingPt}
                    />
                  )
                  : (
                    <TextInput
                      id="gen-worth-ad"
                      labelText="Deer browse (AD)"
                      type="number"
                      onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
                      defaultValue={genWorthVals.ad.value}
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
                isRead
                  ? (
                    <ReadOnlyInput
                      id="gen-worth-dfs-readonly"
                      label="Dothistroma needle blight (DFS):"
                      value={genWorthVals.dfs.value}
                      showSkeleton={isCalculatingPt}
                    />
                  )
                  : (
                    <TextInput
                      id="gen-worth-dfs"
                      labelText="Dothistroma needle blight (DFS):"
                      type="number"
                      onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
                      defaultValue={genWorthVals.dfs.value}
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
                isRead
                  ? (
                    <ReadOnlyInput
                      id="gen-worth-dfu-readonly"
                      label="Cedar leaf blight (DFU):"
                      value={genWorthVals.dfu.value}
                      showSkeleton={isCalculatingPt}
                    />
                  )
                  : (
                    <TextInput
                      id="gen-worth-dfu"
                      labelText="Cedar leaf blight (DFU):"
                      type="number"
                      onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
                      defaultValue={genWorthVals.dfu.value}
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
                isRead
                  ? (
                    <ReadOnlyInput
                      id="gen-worth-dfw-readonly"
                      label="Swiss needle cast (DFW):"
                      value={genWorthVals.dfw.value}
                      showSkeleton={isCalculatingPt}
                    />
                  )
                  : (
                    <TextInput
                      id="gen-worth-dfw"
                      labelText="Swiss needle cast (DFW):"
                      type="number"
                      onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
                      defaultValue={genWorthVals.dfw.value}
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
      {
        !validGenWorth.includes('dsb')
          ? (
            <Column className="info-col" sm={4} md={4} lg={4}>
              {
                isRead
                  ? (
                    <ReadOnlyInput
                      id="gen-worth-dsb-readonly"
                      label="White pine blister rust (DSB):"
                      value={genWorthVals.dsb.value}
                      showSkeleton={isCalculatingPt}
                    />
                  )
                  : (
                    <TextInput
                      id="gen-worth-dsb"
                      labelText="White pine blister rust (DSB):"
                      type="number"
                      onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
                      defaultValue={genWorthVals.dsb.value}
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
                isRead
                  ? (
                    <ReadOnlyInput
                      id="gen-worth-dsc-readonly"
                      label="Comandra blister rust (DSC):"
                      value={genWorthVals.dsc.value}
                      showSkeleton={isCalculatingPt}
                    />
                  )
                  : (
                    <TextInput
                      id="gen-worth-dsc"
                      labelText="Comandra blister rust (DSC):"
                      type="number"
                      onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
                      defaultValue={genWorthVals.dsc.value}
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
                isRead
                  ? (
                    <ReadOnlyInput
                      id="gen-worth-dsg-readonly"
                      label="Western gall rust (DSG):"
                      value={genWorthVals.dsg.value}
                      showSkeleton={isCalculatingPt}
                    />
                  )
                  : (
                    <TextInput
                      id="gen-worth-dsg"
                      labelText="Western gall rust (DSG):"
                      type="number"
                      onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
                      defaultValue={genWorthVals.dsg.value}
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
                isRead
                  ? (
                    <ReadOnlyInput
                      id="gen-worth-gvo-readonly"
                      label="Volume growth (GVO):"
                      value={genWorthVals.gvo.value}
                      showSkeleton={isCalculatingPt}
                    />
                  )
                  : (
                    <TextInput
                      id="gen-worth-gvo"
                      labelText="Volume growth (GVO):"
                      type="number"
                      onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
                      defaultValue={genWorthVals.gvo.value}
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
      {
        !validGenWorth.includes('iws')
          ? (
            <Column className="info-col" sm={4} md={4} lg={4}>
              {
                isRead
                  ? (
                    <ReadOnlyInput
                      id="gen-worth-iws-readonly"
                      label="White pine terminal weevil (IWS):"
                      value={genWorthVals.iws.value}
                      showSkeleton={isCalculatingPt}
                    />
                  )
                  : (
                    <TextInput
                      id="gen-worth-iws"
                      labelText="White pine terminal weevil (IWS):"
                      type="number"
                      onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
                      defaultValue={genWorthVals.iws.value}
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
                isRead
                  ? (
                    <ReadOnlyInput
                      id="gen-worth-wdu-readonly"
                      label="Durability (WDU):"
                      value={genWorthVals.wdu.value}
                      showSkeleton={isCalculatingPt}
                    />
                  )
                  : (
                    <TextInput
                      id="gen-worth-wdu"
                      labelText="Durability (WDU):"
                      type="number"
                      onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
                      defaultValue={genWorthVals.wdu.value}
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
                isRead
                  ? (
                    <ReadOnlyInput
                      id="gen-worth-wve-readonly"
                      label="Wood velocity measures (WVE):"
                      value={genWorthVals.wve.value}
                      showSkeleton={isCalculatingPt}
                    />
                  )
                  : (
                    <TextInput
                      id="gen-worth-wve"
                      labelText="Wood velocity measures (WVE):"
                      type="number"
                      onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
                      defaultValue={genWorthVals.wve.value}
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
                isRead
                  ? (
                    <ReadOnlyInput
                      id="gen-worth-wwd-readonly"
                      label="Wood density (WWD):"
                      value={genWorthVals.wwd.value}
                      showSkeleton={isCalculatingPt}
                    />
                  )
                  : (
                    <TextInput
                      id="gen-worth-wwd"
                      labelText="Wood density (WWD):"
                      type="number"
                      onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
                      defaultValue={genWorthVals.wwd.value}
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
  );
};

export default UnrelatedGenWorth;
