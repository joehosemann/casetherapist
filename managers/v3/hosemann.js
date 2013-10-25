//Utilities

function modifyString (str, addition, position) {
	return [str.slice(0, position), addition, str.slice(position)].join('');
}