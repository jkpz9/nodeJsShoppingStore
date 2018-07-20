module.exports = () => {
	let stampmonths = new Array( "01","02","03","04","05","06","07","08","09","10","11","12");
	let theDate = new Date();
return (stampmonths[ theDate.getMonth()] + theDate.getDate() + theDate.getFullYear() + theDate.getHours() + theDate.getMinutes() + theDate.getSeconds());
}