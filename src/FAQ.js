import React from 'react';
import './FAQ.css';

const faqs = [
    {
        question: "A) HOW TO APPLY?",
        answers: [
            "1. The Buyer/Dealer must register with Auto Selection (Wholesale) or the Company before the Buyer/Dealer is able to bid on our website.",
            "2. Click here to register.",
            "3. Successful applicants will receive an email notification with the relevant Login Username and Password to use in the portal.",
            "4. For further details, please see Term and Conditions Clause (4)."
        ]
    },
    {
        question: "B) IS MEMBERSHIP FREE?",
        answers: [
            "Yes, membership is free, and no charges are applicable to participate in the bidding.",
            "However, this may be subjected to change when required."
        ]
    },
    {
        question: "C) WHEN DOES TENDER TAKE PLACE AND HOW OFTEN?",
        answers: [
            "1. Tender takes place on a weekly basis.",
            "2. Tender List is made available every Tuesday by 6pm.",
            "3. Online tender closes at 3pm on Thursdays.",
            "4. This is subject to change without prior notice."
        ]
    },
    {
        question: "D) WHERE CAN I VIEW THE CARS?",
        answers: [
            "Cars can be viewed at 170 Upper Bukit Timah Road, Bukit Timah Shopping Centre Level 7 Carpark, Singapore 588179."
        ]
    },
    {
        question: "E) WHAT IS THE TENDER PROCESS?",
        answers: [
            "1. Vehicles for Tender can be viewed from our website www.sdsawholesale.sg.",
            "2. As each Bid is registered, an email response is sent automatically.",
            "3. Auto Selection may accept a Bid, which may not be the highest.",
            "4. Auto Selection will notify and raise a Vehicle Sales Agreement (VSAT) followed by an invoice."
        ]
    },
    {
        question: "F) SECOND ROUND TENDER PROCESS",
        answers: [
            "1. Top 5 bidders may be invited via email into a second round of electronic bidding.",
            "2. They must re-login to revise their bids."
        ]
    }
];

const FAQ = () => {

    return (
        <div className="faq-container">
            <h1 className="faq-heading">Frequently Asked Questions</h1>
            <div className="faq-list">
                {faqs.map((item, index) => (
                    <div key={index} className="faq-item">
                        <h3 className="faq-question">{item.question}</h3>
                        <ul className="faq-answers">
                            {item.answers.map((ans, i) => (
                                <li key={i}>{ans}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
