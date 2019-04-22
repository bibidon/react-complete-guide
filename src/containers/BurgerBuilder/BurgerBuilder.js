import React, { Component } from 'react';

import Aux from '../../hoc/Auxiliry';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';

const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.6
};

class BurgerBuilder extends Component {
    state = {
        ingredients: {
            salad: 0,
            bacon: 0,
            cheese: 0,
            meat: 0
        },
        totalPrice: 4,
        purchasable: false
    };

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

    render() {
        const disableInfo = { ...this.state.ingredients };

        for (const key in disableInfo) {
            disableInfo[ key ] = disableInfo[ key ] <= 0;
        }

        return (
            <Aux>
                <Modal>
                    <OrderSummary ingredients={ this.state.ingredients } />
                </Modal>
                <Burger ingredients={ this.state.ingredients } />
                <BuildControls
                    ingredientAdded={ this.addIngredientHandler }
                    ingredientRemoved={ this.removeIngredientHandler }
                    disabled={ disableInfo }
                    price={ this.state.totalPrice }
                    purchasable={ this.state.purchasable }
                />
            </Aux>
        );
    }
}

export default BurgerBuilder;