import { useState } from 'react';
import futurePagePreview from '../../images/future-page.png';
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
    latePayments: 'None in 12 months',
  },
  {
    name: 'BPL',
    product: 'Bridge Loan',
    minCreditScore: 620,
    minLoanAmount: 100000,
    minPropertyValue: 150000,
    maxLtv: 75,
    latePayments: 'One allowed',
  },
];

export default function Pricing() {
  const [loanType, setLoanType] = useState('purchase');
  const [propertyValue, setPropertyValue] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [creditScore, setCreditScore] = useState('');
  const [refinanceType, setRefinanceType] = useState('cashOut');

  const ltv =
    Number(propertyValue) > 0
      ? (Number(loanAmount) / Number(propertyValue)) * 100
      : 0;

  const hasValidLoan =
    Number(propertyValue) > 0 &&
    Number(loanAmount) > 0 &&
    Number(creditScore) >= 300 &&
    Number(creditScore) <= 850;

  const eligibleLenders = hasValidLoan
    ? lenders.filter((lender) => {
        return (
          Number(creditScore) >= lender.minCreditScore &&
          Number(loanAmount) >= lender.minLoanAmount &&
          Number(propertyValue) >= lender.minPropertyValue &&
          ltv <= lender.maxLtv
        );
      })
    : [];

  return (
    <PageLayout showBackButton>
      <div className="page-container">
        <section className="pricing-heading">
          <div>
            <p className="page-label">Loan Pricing</p>
            <h1>John Doe</h1>
            <p>Review borrower information and compare eligible lenders.</p>
          </div>
        </section>

        <div className="pricing-grid">
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

          <section className="content-card">
            <div className="card-heading">
              <h2>Pricing</h2>
              <p>Enter loan parameters to determine lender eligibility.</p>
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
                placeholder="$250,000"
                value={propertyValue}
                onChange={(event) => setPropertyValue(event.target.value)}
              />

              <FormInput
                label="Loan Amount"
                id="loanAmount"
                type="number"
                placeholder="$200,000"
                value={loanAmount}
                onChange={(event) => setLoanAmount(event.target.value)}
              />

              {loanType === 'refinance' && (
                <div className="form-group">
                  <label htmlFor="refinanceType">Refinance Type</label>
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

              <FormInput
                label="Borrower Credit Score"
                id="creditScore"
                type="number"
                placeholder="720"
                value={creditScore}
                onChange={(event) => setCreditScore(event.target.value)}
              />

              <div className="detail-item">
                <span>Loan-to-Value (LTV)</span>
                <strong>
                  {Number(propertyValue) > 0 && Number(loanAmount) > 0
                    ? `${ltv.toFixed(2)}%`
                    : 'Enter loan details'}
                </strong>
              </div>
            </form>
          </section>
        </div>

        <section className="content-card preview-card">
          <div className="card-heading">
            <h2>Future Application</h2>
            <p>Planned design for the completed mortgage pricing platform.</p>
          </div>

          <img
            src={futurePagePreview}
            alt="Planned mortgage pricing page"
            className="future-page-image"
          />
        </section>

        <section className="content-card lender-section">
          <div className="card-heading">
            <h2>Eligible Lenders</h2>
            <p>
              Automatically filtered using mock credit score, loan amount,
              property value, and LTV requirements.
            </p>
          </div>

          <div className="integration-status">
            <div className="status-item">
              <span className="status-dot" />
              Third-party property valuation and pricing data will appear here.
            </div>

            <div className="status-item">
              <span className="status-dot" />
              Real-time lender guideline updates received through WebSocket
              will appear here.
            </div>
          </div>

          <div className="table-wrapper">
            {!hasValidLoan ? (
              <p>Enter valid loan details to see eligible lenders.</p>
            ) : eligibleLenders.length === 0 ? (
              <p>No lenders currently qualify for this loan scenario.</p>
            ) : (
              <table className="lender-table">
                <thead>
                  <tr>
                    <th>Lender</th>
                    <th>Product</th>
                    <th>Minimum Credit Score</th>
                    <th>Maximum LTV</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {eligibleLenders.map((lender) => (
                    <tr key={lender.name}>
                      <td>{lender.name}</td>
                      <td>{lender.product}</td>
                      <td>{lender.minCreditScore}</td>
                      <td>{lender.maxLtv}%</td>
                      <td>Eligible</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="future-results">
            <p>Third-party pricing results will appear here.</p>
            <p>Live lender guideline updates will appear here.</p>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
