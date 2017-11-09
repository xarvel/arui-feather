import React from 'react';
import Type from 'prop-types';
import Icon from '../../icon';
import cn from '../../../cn';
import performance from '../../../performance';

@performance()
@cn('icon')
class IconMBlack extends React.Component {
    static propTypes = {
        /** Идентификатор компонента в DOM */
        id: Type.string,
        /** Размер иконки */
        size: Type.oneOf(['xs', 's', 'm', 'l', 'xl', 'xxl'])
    };

    render(cn) {
        let mods = {
            size: this.props.size,
            name: 'add-m-black'
        };

        return (
            <span className='hah'>
                <Icon className={ cn(mods) } size='m' />
            </span>
        );
    }
}

export default IconMBlack;
