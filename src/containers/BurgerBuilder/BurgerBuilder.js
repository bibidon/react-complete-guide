import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import Aux from '../../hoc/Auxiliry/Auxiliry';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import * as actions from '../../store/actions/index';
import axios from '../../axios-orders';

const burgerBuilder = props => {
    const [ purchasing, setPurchasing ] = useState(false);

    useEffect(() => {
        props.onInitIngredients();
    }, []);

    const updatePurchaseState = ingredients => {
        const sum = Object
            .keys(ingredients)
            .map(igKey => {
                return ingredients[ igKey ];
            })
            .reduce((sum, el) => {
                return sum + el;
            }, 0);

        return sum > 0;
    };

    const purchaseHandler = () => {
        if (props.isAuthenticated) {
            setPurchasing(true);
        } else {
            props.onSetAuthRedirectPath('/checkout/contact-data');
            props.history.push('/auth');
        }
    };

    const purchaseCancelHandler = () => {
        setPurchasing(false);
    };

    const purchaseContinueHandler = () => {
        props.onInitPurchase();

        props.history.push('/checkout');
    };

    const disableInfo = { ...props.ings };
    let orderSummary = null,
        burger = props.error ? <p>Ingredients can not be loaded!</p> : <Spinner />;

    if (props.ings) {
        burger = (
            <Aux>
                <Burger ingredients={ props.ings } />
                <BuildControls
                    ingredientAdded={ props.onIngredientAdded }
                    ingredientRemoved={ props.onIngredientRemoved }
                    disabled={ disableInfo }
                    price={ props.price }
                    ordered={ purchaseHandler }
                    isAuth={ props.isAuthenticated }
                    purchasable={ updatePurchaseState(props.ings) } />
            </Aux>
        );
        orderSummary = <OrderSummary
            ingredients={ props.ings }
            purchaseCancelled={ purchaseCancelHandler }
            purchaseContinued={ purchaseContinueHandler }
            price={ props.price } />
    }

    for (const key in disableInfo) {
        disableInfo[ key ] = disableInfo[ key ] <= 0;
    }

    return (
        <Aux>
            <Modal show={ purchasing } modalClosed={ purchaseCancelHandler }>
                { orderSummary }
            </Modal>
            { burger }
        </Aux>
    );
};

const mapStateToProps = state => {
    return {
        ings: state.burgerBuilder.ingredients,
        price: state.burgerBuilder.totalPrice,
        error: state.burgerBuilder.error,
        isAuthenticated: state.auth.token !== null
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onIngredientAdded: ingName => dispatch(actions.addIngredient(ingName)),
        onIngredientRemoved: ingName => dispatch(actions.removeIngredient(ingName)),
        onInitIngredients: () => dispatch(actions.initIngredients()),
        onInitPurchase: () => dispatch(actions.purchaseInit()),
        onSetAuthRedirectPath: path => dispatch(actions.setAuthRedirectPath(path))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(burgerBuilder, axios));
