import React, { Component } from 'react';

import Aux from '../../hoc/Auxiliry/Auxiliry';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import axios from '../../axios-orders';

const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.6
};

class BurgerBuilder extends Component {
    state = {
        ingredients: null,
        totalPrice: 4,
        purchasable: false,
        purchasing: false,
        loading: false,
        error: false
    };

    componentDidMount() {
        axios.get('https://react-my-burger-4c6eb.firebaseio.com/ingredients.json')
            .then(
                response => {
                    this.setState({ ingredients: response.data });
                }
            )
            .catch(error => {
                this.setState({ error: true });
            });
    }

    updatePurchaseState(ingredients) {
        const sum = Object
            .keys(ingredients)
            .map(igKey => {
                return ingredients[ igKey ];
            })
            .reduce((sum, el) => {
                return sum + el;
            }, 0);
        this.setState({ purchasable: sum > 0 });
    }

    addIngredientHandler = type => {
        const oldCount = this.state.ingredients[ type ],
            updatedCount = oldCount + 1,
            updatedIngredients = { ...this.state.ingredients },
            priceAddition = INGREDIENT_PRICES[ type ],
            oldPrice = this.state.totalPrice,
            newPrice = oldPrice + priceAddition;

        updatedIngredients[ type ] = updatedCount;
        this.setState({
            totalPrice: newPrice,
            ingredients: updatedIngredients
        });
        this.updatePurchaseState(updatedIngredients);
    };

    removeIngredientHandler = type => {
        const oldCount = this.state.ingredients[ type ];
        if (oldCount <= 0) {
            return;
        }

        const updatedCount = oldCount - 1,
            updatedIngredients = { ...this.state.ingredients },
            priceDeduction = INGREDIENT_PRICES[ type ],
            oldPrice = this.state.totalPrice,
            newPrice = oldPrice - priceDeduction;

        updatedIngredients[ type ] = updatedCount;
        this.setState({
            totalPrice: newPrice,
            ingredients: updatedIngredients
        });
        this.updatePurchaseState(updatedIngredients);
    };

    purchaseHandler = () => {
        this.setState({ purchasing: true });
    };

    purchaseCancelHandler = () => {
        this.setState({ purchasing: false });
    };

    purchaseContinueHandler = () => {
        this.setState({ loading: true });

        const order = {
            ingredients: this.state.ingredients,
            price: this.state.totalPrice,
            customer: {
                name: 'Denis',
                address: {
                    street: 'test street',
                    zipCode: '41351',
                    country: 'Belarus'
                },
                email: 'test@test.com'
            },
            deliveryMethod: 'fastest'
        };
        axios.post('/orders.json', order)
            .then(response => {
                this.setState({
                    loading: false,
                    purchasing: false
                });
            })
            .catch(error => {
                this.setState({
                    loading: false,
                    purchasing: false
                });
            });
    };

    render() {
        const disableInfo = { ...this.state.ingredients };
        let orderSummary = null,
            burger = this.state.error ? <p>Ingredients can not be loaded!</p> : <Spinner />;

        if (this.state.ingredients) {
            burger = (<Aux>
                <Burger ingredients={ this.state.ingredients } />
                <BuildControls
                    ingredientAdded={ this.addIngredientHandler }
                    ingredientRemoved={ this.removeIngredientHandler }
                    disabled={ disableInfo }
                    price={ this.state.totalPrice }
                    ordered={ this.purchaseHandler }
                    purchasable={ this.state.purchasable } />
            </Aux>);
            orderSummary = <OrderSummary
                ingredients={ this.state.ingredients }
                purchaseCancelled={ this.purchaseCancelHandler }
                purchaseContinued={ this.purchaseContinueHandler }
                price={ this.state.totalPrice }
            />
        }

        if (this.state.loading) {
            orderSummary = <Spinner />;
        }

        for (const key in disableInfo) {
            disableInfo[ key ] = disableInfo[ key ] <= 0;
        }

        return (
            <Aux>
                <Modal show={ this.state.purchasing } modalClosed={ this.purchaseCancelHandler }>
                    { orderSummary }
                </Modal>
                { burger }
            </Aux>
        );
    }
}

export default withErrorHandler(BurgerBuilder, axios);
