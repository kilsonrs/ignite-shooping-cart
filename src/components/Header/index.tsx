import React from 'react';
import { Link } from 'react-router-dom';
import { MdShoppingBasket } from 'react-icons/md';

import logo from '../../assets/images/logo.svg';
import { Container, Cart } from './styles';
import { useCart } from '../../hooks/useCart';

interface CartSizeProps {
  [key: string]: number;
}

const Header = (): JSX.Element => {
  const { cart } = useCart();

  const cartSize = Object.keys(cart.reduce((total, product) => {
    const previousValue = total?.[product.id];
    const currentValue = previousValue || 0;
    
    return Object.assign(
      total,
      { [product.id]: currentValue + 1 }
    )
  }, {} as CartSizeProps)).length
  
  return (
    <Container>
      <Link to="/">
        <img src={logo} alt="Rocketshoes" />
      </Link>

      <Cart to="/cart">
        <div>
          <strong>Meu carrinho</strong>
          <span data-testid="cart-size">
            {cartSize === 1 ? `${cartSize} item` : `${cartSize} itens`}
          </span>
        </div>
        <MdShoppingBasket size={36} color="#FFF" />
      </Cart>
    </Container>
  );
};

export default Header;
