type SingleOwnerForm = {
  id: number;
  ownerAgency: string;
  ownerCode: string;
  ownerPortion: string;
  reservedPerc: string;
  surplusPerc: string;
  fundingSource: string;
  methodOfPayment: string;
};

type RegisterOwnerArray = Array<SingleOwnerForm>;

type RegisterOwnerData = {
  [seedlotnumber: string]: RegisterOwnerArray
}

export default RegisterOwnerData;
