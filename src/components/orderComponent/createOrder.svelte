<script lang="ts">
	import Select, { Option } from '@smui/select';
	import Card from '@smui/card/src/Card.svelte';
	import { profile, langChange } from '../../store';
	import { afterUpdate, beforeUpdate, onMount } from 'svelte';
	import Button, { Label } from '@smui/button';
	import { GET, POST } from '../../routes/apiService';
	import add from '../../assets/icons/add.png';
	import tabSeparator from '../../assets/icons/tab-sep.png';
	import SummaryTable from '../summaryTable.svelte';
	import { goto } from '$app/navigation';
	import Product from '../products.svelte';
	import Alerts from '../alerts.svelte';
	import { _ } from 'svelte-i18n';
	import './orders.scss';

	export let formObj: any;
	let customerName: string = '';
	let deliveryTypes: any[] = [];
	let locations: any[] = [];
	let isProducts: boolean = true;
	let isSummary: boolean = false;
	let products: any[] = [];
	let subTotal: number = 0;
	let deliveryCharges: number = 0;
	let vatTotal: number = 0;
	let vat: number = 0;
	let SubTotalArr: any[] = [];
	let vatTotalArr: any[] = [];
	let view = formObj.view;
	let locationId: any;
	let deliveryTypeId: any;
	let bcId: number = 0;
	let rfqType: 'Normal';
	let currentProductPriceList: any = [];
	let productRetailPrice: number = 0;
	let quantityIndex: number = -1;
	let btnText: string = '';
	let currentStatus: string = '';
	let alertData: any;
	let openAlerts: boolean = false;
	let reCallAlerts: any;
	let lang: string = 'en';
	let noLabelDelivery: boolean = false;
	let noLabelLocation: boolean = false;

	onMount(() => {
		lang = localStorage.getItem('language')!;
		profile.subscribe((val: any) => {
			if (val != '') {
				customerName = val.enFullName;
				vat = val.vat;
				bcId = val.bcId;
			}
		});
		getDeliveryTypes();
		getdeliverAddress();
		products = history.state.products == undefined ? [] : history.state.products;
		if (products.length != 0) {
			products.forEach((element: any) => {
				element.quantity = element.qty;
				if (element.productPriceList && element.productPriceList.length > 0) {
					element.productPriceList.forEach((element2: any) => {
						if (
							(element.quantity >= element2.minQuantity &&
								element.quantity <= element2.maxQuantity) ||
							element.maxQuantity == 0
						) {
							element.retailPrice = element2.amount;
							element.bundleId = element2.id;
							element.isBundlePrice = true;
						} else if (
							element2.minQuantity > 0 &&
							element2.maxQuantity == 0 &&
							element.quantity >= element2.minQuantity
						) {
							element.retailPrice = element2.amount;
							element.bundleId = element2.id;
							element.isBundlePrice = true;
						}
					});
				}
				element.unitPrice = element.retailPrice;
				element.vat = ParseFloat(((element.retailPrice * vat) / 100) * element.qty);
				element.totalUnitPrice = +(element.qty * element.retailPrice + element.vat).toFixed(2);
				SubTotalArr.push(element.retailPrice * element.qty);
				vatTotalArr.push(((element.retailPrice * vat) / 100) * element.qty);
			});
			subTotal = +SubTotalArr.reduce((partialSum, a) => partialSum + a, 0).toFixed(2);
			vatTotal = ParseFloat(
				vatTotalArr.reduce((partialSum, a) => partialSum + a, 0) + (deliveryCharges / 100) * vat
			);
		}

		if (view == 'create-rfq') {
			btnText = 'Create RFQ';
		} else if (view == 'edit-rfq') {
			btnText = 'Update RFQ';
			getData();
		} else if (view == 'create-order') {
			btnText = 'Create Order';
		} else if (view == 'edit-order') {
			btnText = 'Update Order';
			getData();
		}
	});

	afterUpdate(() => {
		lang = localStorage.getItem('language')!;
		if (deliveryTypeId > 0) {
			noLabelDelivery = true;
		}
		if (locationId > 0) {
			noLabelLocation = true;
		}
	});

	let getData = async () => {
		if (view == 'edit-rfq') {
			let url = `RFQ/GetById?Id=${formObj.id}`;
			await GET(url).then((result) => {
				vatTotalArr = [];
				(products.length == 0 ? result.data.rfqDetails : products).forEach((element: any) => {
					element.retailPrice = element.unitPrice == null ? 0 : element.unitPrice;
					element.vat = element.vatAmount == undefined ? element.vat : element.vatAmount;
					element.enName = element.productName == undefined ? element.enName : element.productName;
					element.qty = element.quantity;
					element.totalUnitPrice =
						element.quantity * (element.unitPrice == null ? 0 : element.unitPrice);
					vatTotalArr.push(((element.retailPrice * vat) / 100) * element.qty);
				});
				products = products.length == 0 ? result.data.rfqDetails : products;
				locationId = result.data.locationId;
				deliveryTypeId = result.data.deliveryTypeId;
				subTotal = result.data.totalRFQPrice == null ? 0 : result.data.totalRFQPrice;
				vatTotal = result.data.totalVATAmount == null ? 0 : result.data.totalVATAmount;
				deliveryCharges = result.data.deliveryCharges;
				currentStatus = result.data.status;
			});
		} else {
			let url = `Order/GetById?Id=${formObj.id}`;
			await GET(url).then((result) => {
				SubTotalArr = [];
				vatTotalArr = [];
				(products.length == 0 ? result.data.orderDetails : products).forEach((element: any) => {
					element.retailPrice = element.unitPrice;
					element.vat = element.vatAmount == undefined ? element.vat : element.vatAmount;
					element.enName = element.productName == undefined ? element.enName : element.productName;
					element.qty = element.quantity;
					element.totalUnitPrice =
						element.totalPrice == undefined ? element.totalUnitPrice : element.totalPrice;
					SubTotalArr.push(element.retailPrice * element.qty);
					vatTotalArr.push(((element.retailPrice * vat) / 100) * element.qty);
				});
				products = products.length == 0 ? result.data.orderDetails : products;
				locationId = result.data.locationId;
				deliveryTypeId = result.data.deliveryTypeId;
				deliveryCharges = result.data.deliveryCharges;
				subTotal =
					products.length == 0
						? result.data.totalOrderPrice
						: +SubTotalArr.reduce((partialSum, a) => partialSum + a, 0).toFixed(2);
				vatTotal =
					products.length == 0
						? result.data.totalVATAmount
						: ParseFloat(
								vatTotalArr.reduce((partialSum, a) => partialSum + a, 0) +
									(deliveryCharges / 100) * vat
						  );
			});
		}
	};

	let getDeliveryTypes = () => {
		let url = `DeliveryType/GetAll?SortColumn=name&PageNumber=1&PageSize=100&SortOrder=a`;
		GET(url).then((result) => {
			if (result.succeeded) {
				deliveryTypes = [
					{ id: '', name: 'Delivery Type', arName: 'Delivery Type' },
					...result.data
				];
			}
		});
	};

	let getdeliverAddress = () => {
		let url = `Location/GetAllActiveLocation?SortColumn=name&PageNumber=1&PageSize=100&SortOrder=a`;
		GET(url).then((result) => {
			if (result.succeeded) {
				locations = [{ id: '', name: 'Delivery Address' }, ...result.data];
			}
		});
	};

	let onChangeBlock = (type: string) => {
		if (products.length <= 0) {
			return;
		} else {
			if (type == 'products') {
				isProducts = true;
				isSummary = false;
			} else if (type == 'summary') {
				isProducts = false;
				isSummary = true;
			}
		}
	};

	let onContinue = () => {
		isProducts = false;
		isSummary = true;
	};

	let onAddProducts = () => {
		if (view == 'create-rfq') {
			goto('/main/rfqs/add-products', { state: { type: view, selectedProducts: products } });
		} else if (view == 'edit-rfq') {
			goto('/main/rfqs/add-products', {
				state: { type: view, selectedProducts: products, id: formObj.id }
			});
		} else if (view == 'create-order') {
			goto('/main/orders/add-products', { state: { type: view, selectedProducts: products } });
		} else if (view == 'edit-order') {
			goto('/main/orders/add-products', {
				state: { type: view, selectedProducts: products, id: formObj.id }
			});
		}
	};

	let ParseFloat = (n: any) => {
		n = Number(n.toString().match(/^\d+(?:\.\d{0,2})?/));
		return n;
	};

	let onDeliveryType = (charges: number) => {
		deliveryCharges = charges;
		vatTotal = ParseFloat(
			vatTotalArr.reduce((partialSum, a) => partialSum + a, 0) + (deliveryCharges / 100) * vat
		);
	};

	let getProductsPriceList = (id: any, element: any) => {
		currentProductPriceList = [];
		productRetailPrice = 0;
		let url = `Product/GetProductPriceListByProductId?productId=${id}`;
		GET(url).then((result) => {
			if (result.succeeded) {
				currentProductPriceList = result.data.productPriceList;
				productRetailPrice = result.data.retailPrice;
				element.qty = element.quantity;
				element.quantity = element.quantity;
				if (
					(view != 'edit-order' ? element.productPriceList : currentProductPriceList) &&
					(view != 'edit-order'
						? element.productPriceList.length
						: currentProductPriceList.length) > 0
				) {
					(view != 'edit-order' ? element.productPriceList : currentProductPriceList).forEach(
						(element2: any) => {
							if (
								element.quantity >= element2.minQuantity &&
								(element.quantity <= element2.maxQuantity || element2.maxQuantity == 0)
							) {
								element.retailPrice = element2.amount;
								element.bundleId = element2.id;
								element.isBundlePrice = true;
								subTotal = 0;
								vatTotal = 0;
								SubTotalArr = [];
								vatTotalArr = [];
								products.forEach((element: any) => {
									if (!element.deleted) {
										SubTotalArr.push(element.retailPrice * element.qty);
										vatTotalArr.push(((element.retailPrice * vat) / 100) * element.qty);
									}
								});
								element.vat = ParseFloat((element.retailPrice * element.quantity * vat) / 100);
								element.totalUnitPrice = +(
									element.retailPrice * element.quantity +
									element.vat
								).toFixed(2);
							} else if (
								element.quantity <
								(view != 'edit-order'
									? element.productPriceList[0].minQuantity
									: currentProductPriceList[0].minQuantity)
							) {
								element.retailPrice = view != 'edit-order' ? element.unitPrice : productRetailPrice;
								element.bundleId = null;
								element.isBundlePrice = false;
								subTotal = 0;
								vatTotal = 0;
								SubTotalArr = [];
								vatTotalArr = [];
								products.forEach((element: any) => {
									if (!element.deleted) {
										SubTotalArr.push(element.retailPrice * element.qty);
										vatTotalArr.push(((element.retailPrice * vat) / 100) * element.qty);
									}
								});
								element.vat = ParseFloat((element.retailPrice * element.quantity * vat) / 100);
								element.totalUnitPrice = +(
									element.retailPrice * element.quantity +
									element.vat
								).toFixed(2);
							}
						}
					);
				} else {
					subTotal = 0;
					vatTotal = 0;
					SubTotalArr = [];
					vatTotalArr = [];
					products.forEach((element: any) => {
						if (!element.deleted) {
							SubTotalArr.push(element.retailPrice * element.qty);
							vatTotalArr.push(((element.retailPrice * vat) / 100) * element.qty);
						}
					});
					element.vat = ParseFloat((element.retailPrice * element.quantity * vat) / 100);
					element.totalUnitPrice = +(element.retailPrice * element.quantity + element.vat).toFixed(
						2
					);
				}
			}
			subTotal = +SubTotalArr.reduce((partialSum, a) => partialSum + a, 0).toFixed(2);
			vatTotal = ParseFloat(
				vatTotalArr.reduce((partialSum, a) => partialSum + a, 0) + (deliveryCharges / 100) * vat
			);
		});
	};

	let onQuantityClick = (ev: any) => {
		if (quantityIndex != ev.detail.index) {
			getProductsPriceList(
				view != 'edit-order'
					? ev.detail.element.id
					: ev.detail.element.productId == undefined
					? ev.detail.element.id
					: ev.detail.element.productId,
				ev.detail.element
			);
			quantityIndex = ev.detail.index;
		}
		if (ev.detail.type == 'inc') {
			ev.detail.element.qty++;
			ev.detail.element.quantity++;
			if (
				(view != 'edit-order' ? ev.detail.element.productPriceList : currentProductPriceList) &&
				(view != 'edit-order'
					? ev.detail.element.productPriceList.length
					: currentProductPriceList.length) > 0
			) {
				(view != 'edit-order'
					? ev.detail.element.productPriceList
					: currentProductPriceList
				).forEach((element2: any) => {
					if (
						ev.detail.element.quantity >= element2.minQuantity &&
						(ev.detail.element.quantity <= element2.maxQuantity || element2.maxQuantity == 0)
					) {
						ev.detail.element.retailPrice = element2.amount;
						ev.detail.element.bundleId = element2.id;
						ev.detail.element.isBundlePrice = true;
						subTotal = 0;
						vatTotal = 0;
						SubTotalArr = [];
						vatTotalArr = [];
						products.forEach((element: any) => {
							if (!element.deleted) {
								SubTotalArr.push(element.retailPrice * element.qty);
								vatTotalArr.push(((element.retailPrice * vat) / 100) * element.qty);
							}
						});
						ev.detail.element.vat = ParseFloat(
							(ev.detail.element.retailPrice * ev.detail.element.quantity * vat) / 100
						);
						ev.detail.element.totalUnitPrice = +(
							ev.detail.element.retailPrice * ev.detail.element.quantity +
							ev.detail.element.vat
						).toFixed(2);
					}
				});
			} else {
				subTotal = 0;
				vatTotal = 0;
				SubTotalArr = [];
				vatTotalArr = [];
				products.forEach((element: any) => {
					if (!element.deleted) {
						SubTotalArr.push(element.retailPrice * element.qty);
						vatTotalArr.push(+(((element.retailPrice * vat) / 100) * element.qty).toFixed(2));
					}
				});
				ev.detail.element.vat = ParseFloat(
					(ev.detail.element.retailPrice * ev.detail.element.quantity * vat) / 100
				);
				ev.detail.element.totalUnitPrice = +(
					ev.detail.element.retailPrice * ev.detail.element.quantity +
					ev.detail.element.vat
				).toFixed(2);
			}
		} else if (ev.detail.type == 'dec') {
			if (ev.detail.element.qty == 1 || ev.detail.element.quantity == 1) {
				subTotal = 0;
				vatTotal = 0;
				SubTotalArr = [];
				vatTotalArr = [];
				ev.detail.element.vat = ParseFloat(
					(ev.detail.element.retailPrice * ev.detail.element.quantity * vat) / 100
				);
				ev.detail.element.totalUnitPrice = +(
					ev.detail.element.retailPrice * ev.detail.element.quantity +
					ev.detail.element.vat
				).toFixed(2);
				products.forEach((element: any) => {
					if (!element.deleted) {
						SubTotalArr.push(element.retailPrice * element.qty);
						vatTotalArr.push(((element.retailPrice * vat) / 100) * element.qty);
					}
				});
			} else {
				if (
					(view != 'edit-order' ? ev.detail.element.productPriceList : currentProductPriceList) &&
					(view != 'edit-order'
						? ev.detail.element.productPriceList.length
						: currentProductPriceList.length) > 0
				) {
					(view != 'edit-order'
						? ev.detail.element.productPriceList
						: currentProductPriceList
					).forEach((element2: any) => {
						if (
							ev.detail.element.quantity >= element2.minQuantity &&
							(ev.detail.element.quantity <= element2.maxQuantity || element2.maxQuantity == 0)
						) {
							ev.detail.element.retailPrice = element2.amount;
							ev.detail.element.bundleId = element2.id;
							ev.detail.element.isBundlePrice = true;
							ev.detail.element.qty--;
							ev.detail.element.quantity--;
							subTotal = 0;
							vatTotal = 0;
							SubTotalArr = [];
							vatTotalArr = [];
							products.forEach((element: any) => {
								if (!element.deleted) {
									SubTotalArr.push(element.retailPrice * element.qty);
									vatTotalArr.push(((element.retailPrice * vat) / 100) * element.qty);
								}
							});
							ev.detail.element.vat = ParseFloat(
								(ev.detail.element.retailPrice * ev.detail.element.quantity * vat) / 100
							);
							ev.detail.element.totalUnitPrice = +(
								ev.detail.element.retailPrice * ev.detail.element.quantity +
								ev.detail.element.vat
							).toFixed(2);
						}
					});
				} else {
					subTotal = 0;
					vatTotal = 0;
					SubTotalArr = [];
					vatTotalArr = [];
					ev.detail.element.qty--;
					ev.detail.element.quantity--;
					ev.detail.element.vat = ParseFloat(
						(ev.detail.element.retailPrice * ev.detail.element.quantity * vat) / 100
					);
					ev.detail.element.totalUnitPrice = +(
						ev.detail.element.retailPrice * ev.detail.element.quantity +
						ev.detail.element.vat
					).toFixed(2);
					products.forEach((element: any) => {
						if (!element.deleted) {
							SubTotalArr.push(element.retailPrice * element.qty);
							vatTotalArr.push(((element.retailPrice * vat) / 100) * element.qty);
						}
					});
				}
			}
		} else if (ev.detail.type == 'change') {
			ev.detail.element.qty = ev.detail.quantity;
			ev.detail.element.quantity = ev.detail.quantity;
			if (
				(view != 'edit-order' ? ev.detail.element.productPriceList : currentProductPriceList) &&
				(view != 'edit-order'
					? ev.detail.element.productPriceList.length
					: currentProductPriceList.length) > 0
			) {
				(view != 'edit-order'
					? ev.detail.element.productPriceList
					: currentProductPriceList
				).forEach((element2: any) => {
					if (
						ev.detail.element.quantity >= element2.minQuantity &&
						(ev.detail.element.quantity <= element2.maxQuantity || element2.maxQuantity == 0)
					) {
						ev.detail.element.retailPrice = element2.amount;
						ev.detail.element.bundleId = element2.id;
						ev.detail.element.isBundlePrice = true;
						subTotal = 0;
						vatTotal = 0;
						SubTotalArr = [];
						vatTotalArr = [];
						products.forEach((element: any) => {
							if (!element.deleted) {
								SubTotalArr.push(element.retailPrice * element.qty);
								vatTotalArr.push(((element.retailPrice * vat) / 100) * element.qty);
							}
						});
						ev.detail.element.vat = ParseFloat(
							(ev.detail.element.retailPrice * ev.detail.element.quantity * vat) / 100
						);
						ev.detail.element.totalUnitPrice = +(
							ev.detail.element.retailPrice * ev.detail.element.quantity +
							ev.detail.element.vat
						).toFixed(2);
					} else if (
						ev.detail.element.quantity <
						(view != 'edit-order'
							? ev.detail.element.productPriceList[0].minQuantity
							: currentProductPriceList[0].minQuantity)
					) {
						ev.detail.element.retailPrice =
							view != 'edit-order' ? ev.detail.element.unitPrice : productRetailPrice;
						ev.detail.element.bundleId = null;
						ev.detail.element.isBundlePrice = false;
						subTotal = 0;
						vatTotal = 0;
						SubTotalArr = [];
						vatTotalArr = [];
						products.forEach((element: any) => {
							if (!element.deleted) {
								SubTotalArr.push(element.retailPrice * element.qty);
								vatTotalArr.push(((element.retailPrice * vat) / 100) * element.qty);
							}
						});
						ev.detail.element.vat = ParseFloat(
							(ev.detail.element.retailPrice * ev.detail.element.quantity * vat) / 100
						);
						ev.detail.element.totalUnitPrice = +(
							ev.detail.element.retailPrice * ev.detail.element.quantity +
							ev.detail.element.vat
						).toFixed(2);
					}
				});
			} else {
				subTotal = 0;
				vatTotal = 0;
				SubTotalArr = [];
				vatTotalArr = [];
				products.forEach((element: any) => {
					if (!element.deleted) {
						SubTotalArr.push(element.retailPrice * element.qty);
						vatTotalArr.push(((element.retailPrice * vat) / 100) * element.qty);
					}
				});
				ev.detail.element.vat = ParseFloat(
					(ev.detail.element.retailPrice * ev.detail.element.quantity * vat) / 100
				);
				ev.detail.element.totalUnitPrice = +(
					ev.detail.element.retailPrice * ev.detail.element.quantity +
					ev.detail.element.vat
				).toFixed(2);
			}
		}
		subTotal = +SubTotalArr.reduce((partialSum, a) => partialSum + a, 0).toFixed(2);
		vatTotal = ParseFloat(
			vatTotalArr.reduce((partialSum, a) => partialSum + a, 0) + (deliveryCharges / 100) * vat
		);
	};

	let onDeleteProduct = (id: any) => {
		if (view == 'edit-order' || view == 'edit-rfq') {
			products.filter((element: any) => {
				if (element.id == id.detail) {
					element.deleted = true;
				}
			});
		} else {
			products.filter((element: any, index: number) => {
				if (element.id == id.detail || element.productId == id.detail) {
					products.splice(index, 1);
				}
			});
		}
		subTotal = 0;
		vatTotal = 0;
		SubTotalArr = [];
		vatTotalArr = [];
		products.forEach((element: any) => {
			if (!element.deleted) {
				SubTotalArr.push(element.retailPrice * element.qty);
				vatTotalArr.push(((element.retailPrice * vat) / 100) * element.qty);
			}
		});
		subTotal = +SubTotalArr.reduce((partialSum, a) => partialSum + a, 0).toFixed(2);
		vatTotal = ParseFloat(
			vatTotalArr.reduce((partialSum, a) => partialSum + a, 0) + (deliveryCharges / 100) * vat
		);
	};

	let onSubmit = () => {
		if (view == 'create-rfq' || view == 'edit-rfq') {
			let url = 'RFQ/AddUpdate';
			let finalArr: any = [];
			products.forEach((element: any) => {
				finalArr.push({
					id: view == 'edit-rfq' ? (element.productId == undefined ? 0 : element.id) : 0,
					rfqId: view == 'edit-rfq' ? formObj.id : 0,
					productId: element.productId == undefined ? element.id : element.productId,
					quantity: element.qty,
					unitPrice: 0,
					totalPrice: 0,
					deleted: view == 'edit-rfq' ? element.deleted : false
				});
			});
			let data = {
				id: view == 'edit-rfq' ? formObj.id : 0,
				bcId,
				title: '',
				rfqNo: '',
				rfqType,
				status: '',
				locationId,
				rfqDetails: finalArr,
				deliveryTypeId,
				deliveryCharges,
				deliveryChargesWithVAT: 0
			};

			if (locationId != '' && deliveryTypeId != '') {
				POST(url, data).then((result) => {
					if (result.succeeded) {
						goto('/main/rfqs');
						openAlerts = true;
						alertData = {
							heading: 'Success',
							message: lang == 'en' ? result.message : result.arMessage,
							type: 'success'
						};
						reCallAlerts();
					} else {
						openAlerts = true;
						alertData = {
							heading: 'Error',
							message: lang == 'en' ? result.message : result.arMessage,
							type: 'error'
						};
						reCallAlerts();
					}
				});
			} else {
				openAlerts = true;
				alertData = {
					heading: 'Warning',
					message: 'Please fill all required fields.',
					type: 'error'
				};
				reCallAlerts();
			}
		} else {
			let date = new Date();
			date.setDate(date.getDate() + 1);
			let finalArr: any = [];
			products.forEach((element: any) => {
				finalArr.push({
					id: view == 'edit-order' ? (element.productId == undefined ? 0 : element.id) : 0,
					productId: element.productId == undefined ? element.id : element.productId,
					orderId: view == 'edit-order' ? parseInt(formObj.id) : 0,
					quantity: element.qty,
					unitPrice: element.retailPrice,
					totalPrice: element.totalUnitPrice,
					isBundlePrice: element.isBundlePrice,
					bundleId: element.bundleId,
					vatRate: vat,
					vatAmount: ParseFloat((element.qty * element.retailPrice * vat) / 100),
					deleted: view == 'edit-order' ? element.deleted : false
				});
			});
			let grandTotal = vatTotal + subTotal + deliveryCharges;
			let data = {
				id: view == 'edit-order' ? parseInt(formObj.id) : null,
				title: 'New Order',
				orderDate: new Date(),
				rfqId: null,
				orderType: '',
				paymentStatus: '',
				status: null,
				deliveryTypeId,
				deliveryCharges,
				deliveryChargesWithVAT: 0,
				locationId,
				bcId,
				totalOrderPrice: subTotal,
				vatRate: vat,
				vatAmount: ParseFloat(vatTotal),
				totalVATAmount: ParseFloat(vatTotal),
				totalAmount: parseFloat(grandTotal.toFixed(2)),
				storeId: null,
				rejectedRemarks: '',
				orderbyAdmin: true,
				orderDetails: finalArr,
				expDeliveryDay: 2
			};
			let url = `Order/AddUpdate`;
			if (locationId != '' && deliveryTypeId != '') {
				POST(url, data).then((result) => {
					if (result.succeeded) {
						goto('/main/orders');
						openAlerts = true;
						alertData = {
							heading: 'Success',
							message: lang == 'en' ? result.message : result.arMessage,
							type: 'success'
						};
						reCallAlerts();
					} else {
						openAlerts = true;
						alertData = {
							heading: 'Error',
							message: lang == 'en' ? result.message : result.arMessage,
							type: 'error'
						};
						reCallAlerts();
					}
				});
			} else {
				openAlerts = true;
				alertData = {
					heading: 'Warning',
					message: 'Please fill all required fields.',
					type: 'error'
				};
				reCallAlerts();
			}
		}
	};
</script>

<main class="main">
	<Card style="padding:20px">
		<h4 style="font-size: 16px;margin-top:0px;" class="ff-poppins">{$_('Delivery Details')}</h4>
		<div>
			<p style="font-size: 12.2195px; color: #606060;" class="ff-poppins">{$_('Company')}</p>
			<span style="font-size: 14px; color: #252733" class="ff-poppins-semibold">{customerName}</span
			>
		</div>
		<div class="delivery-details">
			<div>
				<p class="ff-poppins" style="font-size:13px; color: #606060">{$_('Delivery Type')}*</p>
				<Select
					class="shaped-filled"
					variant="outlined"
					label={$_('Delivery Type')}
					style="width: 100%;"
					value={deliveryTypeId}
					noLabel={noLabelDelivery}
				>
					{#each deliveryTypes as type}
						<Option
							value={type.id}
							on:click={() => onDeliveryType(type.charges)}
							on:click={() => (deliveryTypeId = type.id)}
							>{lang == 'en' ? type.name : type.arName}</Option
						>
					{/each}
				</Select>
			</div>
			<div>
				<p class="ff-poppins" style="font-size:13px; color: #606060">{$_('Delivery Address')}*</p>
				<Select
					class="shaped-filled"
					variant="outlined"
					label={$_('Delivery Address')}
					style="width: 100%;"
					value={locationId}
					noLabel={noLabelLocation}
				>
					{#each locations as location}
						<Option value={location.id} on:click={() => (locationId = location.id)}
							>{$_(location.name)}</Option
						>
					{/each}
				</Select>
			</div>
		</div>
	</Card>
	<!-- products and invoice switch block  -->
	<div class="tab-section">
		<div class="tab-card div-backgorund">
			<Button
				class="tab-btn ff-poppins-semibold"
				style={isProducts ? 'color:#1779B8;pointer-events:none;' : 'color:#B3B3B3;'}
				on:click={() => onChangeBlock('products')}
			>
				<Label>{$_('Products')}</Label>
			</Button>
			<img
				src={tabSeparator}
				width="24px"
				height="55px"
				alt=""
				style={lang == 'ar' ? 'transform:rotate(180deg)' : ''}
			/>
			<Button
				class="tab-btn ff-poppins-semibold"
				style={isSummary ? 'color:#1779B8;pointer-events:none;' : 'color:#B3B3B3;'}
				on:click={() => onChangeBlock('summary')}
			>
				<Label>{$_('Summary')}</Label>
			</Button>
		</div>
		{#if isProducts}
			<Button
				variant="unelevated"
				class="btn topBtn ff-poppins-semibold"
				on:click={onAddProducts}
				style={lang == 'en' ? 'width:164px' : 'width:128px'}
			>
				<img src={add} alt="" height="18px" width="18px" />
				<Label>{$_('Add Product')}</Label>
			</Button>
		{/if}
	</div>
	<!-- products block -->
	{#if isProducts}
		<div>
			{#if products.length != 0}
				<div class="products-block">
					{#each products as product, index}
						<Product
							data={product}
							{index}
							on:quantityClick={onQuantityClick}
							on:quantityChangeInput={onQuantityClick}
							on:deleteProduct={onDeleteProduct}
						/>
					{/each}
				</div>
			{/if}
			{#if products.length <= 0}
				<div class="no-products">
					<div style="font-size: 13px; font-family: poppins-semibold">
						{$_('No product is selected.')}
					</div>
					<span style="font-size: 13px; font-family: poppins">
						{$_('Please click on add product button to select your product')}</span
					>
				</div>
			{/if}
			<div class="products-buttons">
				<Button
					variant="unelevated"
					class="btn ff-poppins-semibold"
					style="font-size: 14px;place-content:center;"
					on:click={onContinue}
					disabled={products.length <= 0}
				>
					<Label>{$_('Continue')}</Label>
				</Button>
				<Button
					variant="unelevated"
					class="btn topBtn ff-poppins-semibold"
					style="font-size: 14px; border-radius: 7px; margin: 0;width:220px"
					on:click={onAddProducts}
				>
					<img src={add} alt="" height="18px" width="18px" />
					<Label>{$_('Add more products')}</Label>
				</Button>
			</div>
		</div>
	{/if}
	<!-- invoice block  -->
	{#if isSummary}
		<SummaryTable
			{products}
			{subTotal}
			deliveryCharges={view == 'create-rfq' || currentStatus == 'Pending Submission'
				? 0
				: deliveryCharges}
			vatTotal={view == 'create-rfq' || currentStatus == 'Pending Submission' ? 0 : vatTotal}
		/>
		<div style="margin-top: 50px;display:flex;grid-gap:20px;margin-inline:30px;">
			<Button
				class="btn ff-poppins-semibold"
				variant="raised"
				on:click={onSubmit}
			>
				<Label style="width:165px">{$_(btnText)}</Label>
			</Button>
			<Button
				on:click={view == 'create-rfq' || view == 'edit-rfq'
					? () => goto('/main/rfqs')
					: () => goto('/main/orders')}
				class="btn ff-poppins-semibold"
				variant="raised"
				style="background: rgb(149, 152, 154); width:165px;place-content:center"
			>
				<Label>{$_('Cancel')}</Label>
			</Button>
		</div>
	{/if}
</main>

<Alerts {alertData} {openAlerts} bind:reCallAlerts />
