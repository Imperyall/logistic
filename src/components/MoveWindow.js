import React from 'react';

class MoveWindow extends React.Component {

	render() {
		const { show, w_text, r_text } = this.props.data;
		const html = r_text === null 
			? "Точка: " + w_text 
			: "Точка: " + w_text + "<br/>" + "Переместить в: " + r_text;

		return (
			<div
				id="moveText"
				className="moveText"
				dangerouslySetInnerHTML={{__html: html}}
				style={{ display: show && w_text ? "block" : "none" }} />
		);
	}
}

export default MoveWindow;