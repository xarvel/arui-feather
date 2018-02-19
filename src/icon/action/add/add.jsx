/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Icon from '../../../icon';

class IconAdd extends React.Component {
    static propTypes = Icon.propTypes;

    m = <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><g fill='none' fillRule='evenodd'><path d='M0 0h24v24H0z' /><path fill='#0B1F35' fillRule='nonzero' d='M12 11H3v1h9v9h1v-9h9v-1h-9V2h-1v9z' opacity='.9' /></g></svg>

    render() {
        if (this.props.inline) {
            return this[this.props.size];
        }

        return (
            <Icon
                { ...this.props }
                name='add'
            />
        );
    }
}

export default IconAdd;
