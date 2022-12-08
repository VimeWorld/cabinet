import {
	IconFondy,
	IconGooglePay,
	IconInterkassa,
	IconMasterCard,
	IconUnitpay,
	IconVisa
} from '../component/icons';
import React from 'react';

interface PaySystemsInterface {
	name: string;
	description: string;
	icon: React.ReactElement;
	logos: Array<React.ReactElement> | null;
	filter: { it: object | null; message: string };
}

const paySystems: PaySystemsInterface[] = [
	{
		name: 'fondy',
		description: '(Visa / Mastercard / Google Pay / Apple Pay)',
		icon: <IconFondy height={32} />,
		logos: [<IconVisa />, <IconMasterCard />, <IconGooglePay />],
		filter: {
			it: (user: { client_country: string }) => user.client_country != 'RU',
			message: 'Недоступно в РФ'
		}
	},
	{
		name: 'interkassa',
		description: '(Криптовалюты, Perfect Money, AdvCash)',
		icon: <IconInterkassa height={32} />,
		logos: [],
		filter: { it: null, message: '' }
	},
	{
		name: 'unitpay',
		description: '(Yandex Pay)',
		icon: <IconUnitpay height={32} />,
		logos: [<IconVisa />, <IconVisa />],
		filter: {
			it: (user: { client_country: string }) => user.client_country == 'RU',
			message: 'Только для РФ'
		}
	}
];

export default paySystems;
