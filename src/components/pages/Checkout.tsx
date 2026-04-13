import {loadStripe} from "@stripe/stripe-js";
import {useCallback, useState} from "react";
import {EmbeddedCheckout, EmbeddedCheckoutProvider} from "@stripe/react-stripe-js";
import Cookies from "js-cookie";

export default function Checkout(){
    const COOKIE_KEY = 'diabetes-direct-cart'
    const [hasInsurance, setHasInsurance] = useState(false);
    const [insuranceNumber, setInsuranceNumber] = useState('');
    const [insuranceProvider, setInsuranceProvider] = useState('');
    const [hasPrescription, setHasPrescription] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const cartJSON = Cookies.get(COOKIE_KEY)

    // Make sure to call `loadStripe` outside of a component’s render to avoid
    // recreating the `Stripe` object on every render.
    // This is your test publishable API key.
    const stripePromise = loadStripe("pk_test_51T1oaZ1oZgE2bxuy89FITzk2humQjthoQp85XiuCkXXzryh05xUYIgWqGWBFkxAxSIwa9eU0lia6J0ZwDlwIiWAR00LIBUxjsh");

    const fetchClientSecret = useCallback(async () => {
        // Create a Checkout Session with insurance and prescription flags
        const cartData = JSON.parse(cartJSON || '{"items":[]}');
        const requestBody = {
            ...cartData,
            hasInsurance: hasInsurance,
            hasPrescription: hasPrescription
        };
        // The backend will calculate the total price based on the cart items and apply any discounts based on insurance/prescription status
        // then return a client secret for the Stripe Checkout Session
        const response = await fetch("http://localhost:8080/checkout/create-checkout-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });
        const data = await response.json();
        return data.clientSecret || ""; // Ensure a string is always returned
    }, [hasInsurance, hasPrescription, cartJSON]);

    const options = {fetchClientSecret};

    // Validate the cart for prescription and insurance before allowing the user to proceed to checkout
    const validateCart = async () => {
        setIsValidating(true);
        setValidationError(null);
        try {
            const cartData = JSON.parse(cartJSON || '{"items":[]}');
            const response = await fetch("http://localhost:8080/checkout/validate-cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    items: cartData.items,
                    hasPrescription: hasPrescription,
                    hasInsurance: hasInsurance
                })
            });
            const data = await response.json();
            if (!data.isValid) {
                setValidationError(data.error);
                return false;
            }
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            setValidationError(message);
            return false;
        } finally {
            setIsValidating(false);
        }
    };

    const handleProceedToCheckout = async () => {
        // Basic error handling for insurance, must be something in the boxes
        if (hasInsurance && (!insuranceNumber.trim() || !insuranceProvider.trim())) {
            setValidationError('Please fill in all insurance information');
            return;
        }

        // Validate the cart with the backend to ensure all items are eligible for purchase based on prescription and insurance status
        const isValid = await validateCart();
        if (isValid) {
            setShowCheckout(true);
        }
    };

    return(
        <>
            <h1>Checkout</h1>

            {/*If showCheckout is false, show the insurance and prescription form. If true, show the embedded checkout*/}
            {!showCheckout ? (
                <div className="container my-4">
                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title mb-4">Checkout Information</h5>

                                    {validationError && (
                                        <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
                                            {validationError}
                                            <button type="button" className="btn-close" onClick={() => setValidationError(null)}></button>
                                        </div>
                                    )}

                                    {/*Insurance Information Section*/}
                                    <h6 className="mb-3">Insurance Information</h6>
                                    <div className="form-check mb-3">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="hasInsurance"
                                            checked={hasInsurance}
                                            onChange={(e) => {
                                                setHasInsurance(e.target.checked);
                                                if (!e.target.checked) {
                                                    setInsuranceNumber('');
                                                    setInsuranceProvider('');
                                                }
                                            }}
                                        />
                                        {/*When the user checks the box, show additional fields for insurance provider and number.*/}
                                        <label className="form-check-label" htmlFor="hasInsurance">
                                            I have insurance coverage
                                        </label>
                                    </div>

                                    {/*Show text fields for insurance provider and number*/}
                                    {hasInsurance && (
                                        <>
                                            <div className="mb-3">
                                                <label htmlFor="insuranceProvider" className="form-label">Insurance Provider</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="insuranceProvider"
                                                    placeholder="e.g., Blue Cross, Manulife, Sun Life"
                                                    value={insuranceProvider}
                                                    onChange={(e) => setInsuranceProvider(e.target.value)}
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="insuranceNumber" className="form-label">Insurance Number</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="insuranceNumber"
                                                    placeholder="e.g., ABC123456789"
                                                    value={insuranceNumber}
                                                    onChange={(e) => setInsuranceNumber(e.target.value)}
                                                />
                                            </div>

                                            <div className="alert alert-info mb-3">
                                                <small>Your insurance information will be used to apply eligible discounts to your order.</small>
                                            </div>
                                        </>
                                    )}

                                    {/*Prescription section*/}
                                    <hr />
                                    <h6 className="mb-3">Prescription Information</h6>
                                    <div className="form-check mb-4">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="hasPrescription"
                                            checked={hasPrescription}
                                            onChange={(e) => {
                                                setHasPrescription(e.target.checked);
                                            }}
                                        />
                                        <label className="form-check-label" htmlFor="hasPrescription">
                                            I have a valid prescription on file
                                        </label>
                                    </div>

                                    <button
                                        className="btn btn-primary w-100"
                                        onClick={handleProceedToCheckout}
                                        disabled={isValidating}
                                    >
                                        {isValidating ? 'Validating...' : 'Continue to Payment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Center the provider horizontally and limit its width so the embedded checkout is centered on the page */}
                    <div style={{display: 'flex', justifyContent: 'center', padding: '1rem'}}>
                        <div style={{width: '100%', maxWidth: 720}}>
                            <EmbeddedCheckoutProvider
                                stripe={stripePromise}
                                options={options}
                            >
                                <EmbeddedCheckout />
                            </EmbeddedCheckoutProvider>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}