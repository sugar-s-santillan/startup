import { useState } from 'react';
import PageLayout from '../components/PageLayout.jsx';
import FormInput from '../components/FormInput.jsx';


const lenders = [
  {
    name: 'OCMBC',
    product: 'DSCR 30-Year Fixed',
    minCreditScore: 660,
    minLoanAmount: 75000,
    minPropertyValue: 100000,
    maxLtv: 80,
    loanProducts: ['dscr'],
    propertyTypes: ['singleFamily', 'twoToFour', 'condo'],
    loanPurposes: ['purchase', 'rateTerm', 'cashOut'],
  },
  {
    name: 'BPL',
    product: 'Bridge Loan',
    minCreditScore: 620,
    minLoanAmount: 100000,
    minPropertyValue: 150000,
    maxLtv: 75,
    loanProducts: ['bridge'],
    propertyTypes: ['singleFamily', 'twoToFour'],
    loanPurposes: ['purchase', 'cashOut'],
  },
];

export default function Pricing() {
  const [loanProduct, setLoanProduct] = useState('dscr');
  const [propertyType, setPropertyType] = useState('singleFamily');
  const [loanType, setLoanType] = useState('purchase');
  const [propertyValue, setPropertyValue] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [creditScore, setCreditScore] = useState('');
  const [refinanceType, setRefinanceType] = useState('cashOut');

  // Automatically calculate loan-to-value.
  const ltv =
    Number(propertyValue) > 0
      ? (Number(loanAmount) / Number(propertyValue)) * 100
      : 0;

  // Require valid loan inputs before evaluating lenders.
  const hasValidLoan =
    Number(propertyValue) > 0 &&
    Number(loanAmount) > 0 &&
    Number(creditScore) >= 300 &&
    Number(creditScore) <= 850;

  // Evaluate every lender and explain any failed requirements.
  const lenderResults = hasValidLoan
    ? lenders.map((lender) => {
        const reasons = [];

        if (Number(creditScore) < lender.minCreditScore) {
          reasons.push(
            `Minimum credit score: ${lender.minCreditScore}`
          );
        }

        if (Number(loanAmount) < lender.minLoanAmount) {
          reasons.push(
            `Minimum loan amount: $${lender.minLoanAmount.toLocaleString()}`
          );
        }

        if (Number(propertyValue) < lender.minPropertyValue) {
          reasons.push(
            `Minimum property value: $${lender.minPropertyValue.toLocaleString()}`
          );
        }

        if (ltv > lender.maxLtv) {
          reasons.push(`Maximum LTV: ${lender.maxLtv}%`);
        }

        if (!lender.loanProducts.includes(loanProduct)) {
          reasons.push('Loan product not supported');
        }

        if (!lender.propertyTypes.includes(propertyType)) {
          reasons.push('Property type not supported');
        }

        const purpose =
          loanType === 'purchase' ? 'purchase' : refinanceType;

        if (!lender.loanPurposes.includes(purpose)) {
          reasons.push('Loan purpose not supported');
        }

        return {
          ...lender,
          eligible: reasons.length === 0,
          reasons,
        };
      })
    : [];

  const eligibleCount = lenderResults.filter(
    (lender) => lender.eligible
  ).length;

  return (
    <PageLayout showBackButton>
      <div className="page-container">

        {/* Page heading */}
        <section className="pricing-heading">
          <div>
            <p className="page-label">Loan Pricing</p>
            <h1>John Doe</h1>
            <p>
              Review borrower information and compare lender eligibility.
            </p>
          </div>
        </section>

        <div className="pricing-grid">

          {/* Borrower information */}
          <section className="content-card">
            <div className="card-heading">
              <h2>Loan Details</h2>
              <p>Borrower and property information</p>
            </div>

            <div className="loan-details">
              <div className="detail-item">
                <span>Loan Officer</span>
                <strong>Leo</strong>
              </div>

              <div className="detail-item">
                <span>Full Name</span>
                <strong>John Doe</strong>
              </div>

              <div className="detail-item">
                <span>Email</span>
                <strong>john.doe@email.com</strong>
              </div>

              <div className="detail-item">
                <span>Phone</span>
                <strong>(512) 555-5555</strong>
              </div>

              <div className="detail-item">
                <span>Address</span>
                <strong>2855 Ridgemont Drive</strong>
              </div>

              <div className="detail-item">
                <span>City</span>
                <strong>Austin</strong>
              </div>

              <div className="detail-item">
                <span>State</span>
                <strong>Texas</strong>
              </div>

              <div className="detail-item">
                <span>ZIP</span>
                <strong>78704</strong>
              </div>
            </div>
          </section>

          {/* Reactive loan inputs */}
          <section className="content-card">
            <div className="card-heading">
              <h2>Loan Scenario</h2>
              <p>
                Change the loan details to automatically update eligibility.
              </p>
            </div>

            <form
              className="pricing-form"
              onSubmit={(event) => event.preventDefault()}
            >
              <fieldset className="loan-type-fieldset">
                <legend>Loan Type</legend>

                <div className="radio-options">
                  <label className="radio-option">
                    <input
                      type="radio"
                      id="purchase"
                      name="loanType"
                      value="purchase"
                      checked={loanType === 'purchase'}
                      onChange={() => setLoanType('purchase')}
                    />
                    <span className="radio-card">Purchase</span>
                  </label>

                  <label className="radio-option">
                    <input
                      type="radio"
                      id="refinance"
                      name="loanType"
                      value="refinance"
                      checked={loanType === 'refinance'}
                      onChange={() => setLoanType('refinance')}
                    />
                    <span className="radio-card">Refinance</span>
                  </label>
                </div>
              </fieldset>

              <FormInput
                label="Property Value"
                id="propertyValue"
                type="number"
                placeholder="250000"
                value={propertyValue}
                onChange={(event) =>
                  setPropertyValue(event.target.value)
                }
              />

              <FormInput
                label="Loan Amount"
                id="loanAmount"
                type="number"
                placeholder="200000"
                value={loanAmount}
                onChange={(event) =>
                  setLoanAmount(event.target.value)
                }
              />

              {loanType === 'refinance' && (
                <div className="form-group">
                  <label htmlFor="refinanceType">
                    Refinance Type
                  </label>

                  <select
                    id="refinanceType"
                    name="refinanceType"
                    value={refinanceType}
                    onChange={(event) =>
                      setRefinanceType(event.target.value)
                    }
                  >
                    <option value="cashOut">Cash-Out</option>
                    <option value="rateTerm">Rate and Term</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="loanProduct">
                  Loan Product
                </label>

                <select
                  id="loanProduct"
                  name="loanProduct"
                  value={loanProduct}
                  onChange={(event) =>
                    setLoanProduct(event.target.value)
                  }
                >
                  <option value="dscr">
                    DSCR 30-Year Fixed
                  </option>
                  <option value="bridge">
                    Bridge Loan
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="propertyType">
                  Property Type
                </label>

                <select
                  id="propertyType"
                  name="propertyType"
                  value={propertyType}
                  onChange={(event) =>
                    setPropertyType(event.target.value)
                  }
                >
                  <option value="singleFamily">
                    Single-Family Residence
                  </option>
                  <option value="twoToFour">
                    2–4 Unit Property
                  </option>
                  <option value="condo">
                    Condominium
                  </option>
                </select>
              </div>

              <FormInput
                label="Borrower Credit Score"
                id="creditScore"
                type="number"
                placeholder="720"
                value={creditScore}
                onChange={(event) =>
                  setCreditScore(event.target.value)
                }
              />

              <div className="detail-item">
                <span>Loan-to-Value (LTV)</span>
                <strong>
                  {Number(propertyValue) > 0 &&
                  Number(loanAmount) > 0
                    ? `${ltv.toFixed(2)}%`
                    : 'Enter loan details'}
                </strong>
              </div>
            </form>
          </section>
        </div>

        {/* Automatic lender eligibility results */}
        <section className="content-card lender-section">
          <div className="card-heading">
            <h2>Lender Eligibility Matrix</h2>
            <p>
              Results update automatically using mock lender guidelines.
            </p>
          </div>

          {hasValidLoan && (
            <div className="detail-item">
              <span>Eligible Lenders</span>
              <strong>
                {eligibleCount} of {lenders.length}
              </strong>
            </div>
          )}

          <div className="table-wrapper">
            {!hasValidLoan ? (
              <p>
                Enter a valid property value, loan amount, and
                credit score to evaluate lenders.
              </p>
            ) : (
              <table className="lender-table">
                <thead>
                  <tr>
                    <th>Lender</th>
                    <th>Product</th>
                    <th>Minimum FICO</th>
                    <th>Maximum LTV</th>
                    <th>Eligibility</th>
                    <th>Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {lenderResults.map((lender) => (
                    <tr key={lender.name}>
                      <td>{lender.name}</td>
                      <td>{lender.product}</td>
                      <td>{lender.minCreditScore}</td>
                      <td>{lender.maxLtv}%</td>

                      <td>
                        <strong>
                          {lender.eligible
                            ? 'Eligible'
                            : 'Ineligible'}
                        </strong>
                      </td>

                      <td>
                        {lender.eligible
                          ? 'All mock requirements met'
                          : lender.reasons.join('; ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </section>

      </div>
    </PageLayout>
  );
}
