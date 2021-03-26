import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [stock, setStock] = useState<Stock[]>([]);
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      
      const response = await api.get(`/stock/${productId}`)
      const stockApiAmount = response.data.id === productId ? response.data.amount : null;
      
      if(stockApiAmount <= 0) {
        toast.error('Quantidade solicitada fora de estoque');
        throw new Error();
      }

      const _response = await api.get(`/products/${productId}`)
      const product = _response.data;

      const alreadyInCart = cart.some(cartItem => cartItem.id === productId)
      
      if(alreadyInCart) {

        const updateCart = cart.map(item => item.id === productId
          ? {...item, amount: item.amount + 1 }
          : item)
        setCart(updateCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart))
        
        await api.put(`/stock/${productId}`, {
          id: productId,
          amount: response.data.amount - 1
        })
      } else {

        const updateCart = [...cart, { ...product, amount: 1 }];
        setCart(updateCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart))

        const initialStockAmount = stockApiAmount;
        setStock([...stock, {id: productId, amount: initialStockAmount }])
        
        await api.put(`/stock/${productId}`, {
          id: productId,
          amount: response.data.amount - 1
        })
      }
    } catch {
      // TODO
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = async (productId: number) => {
    try {
      // TODO
      const productIndex = cart.findIndex(product => product.id === productId);
      const productToRemove = cart[productIndex];

      if(!productToRemove) {
        throw new Error()
      }

      const updateCart = cart.filter(product => product.id !== productId);

      setCart(updateCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart))

      const response = await api.get(`/stock/${productId}`)
      const apiStockAmount = response.data.amount;
      const newAmount = productToRemove.amount + apiStockAmount;

      setStock(stock.filter(item => item.id !== productId))

      await api.put(`/stock/${productId}`, {
        id: productId,
        amount: newAmount
      })
    } catch {
      // TODO
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      
      const response = await api.get(`/stock/${productId}`)
      const apiStockAmount = response.data.amount;
      
      if(amount <= 0) {
        throw new Error();
      }

      if(apiStockAmount <= 0 || apiStockAmount < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        throw new Error();
      }
      

      const updateCart = cart.map(item => item.id === productId
        ? {...item, amount }
        : item)

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart))
      setCart(updateCart)
      
      const initialStock = stock.filter(product => product.id === productId)[0];
      const newAmount = initialStock.amount - amount;

      await api.put(`/stock/${productId}`, {
        id: productId,
        amount: newAmount,
      })
    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto')
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
