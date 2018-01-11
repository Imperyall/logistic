import React from 'react';
import PropTypes from 'prop-types';

class MoveWindow extends React.Component {

	render() {
		const { show, w_text, r_text } = this.props.data;
		const line1 = "Точка: " + w_text,
					line2 = "Переместить в: " + r_text;

		return (
			<div
				id="moveText"
				className="moveText"
				style={{ display: show && w_text ? "block" : "none" }}>
				<span>{line1}</span>{r_text !== null && <span><br/>{line2}</span>}
			</div>
		);
	}
}

MoveWindow.propTypes = {
	data:   PropTypes.object,
	show:   PropTypes.bool,
	w_text: PropTypes.string,
	r_text: PropTypes.string,
};

export default MoveWindow;