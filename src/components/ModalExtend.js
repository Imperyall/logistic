import React from 'react';
import { Button, Modal, Form, TextArea } from 'semantic-ui-react';

class ModalExtend extends React.Component {

	constructor(props) {
		super(props);
		//console.log(props)
		this.state={
			text: '',
		}

		this.handleChangeText = this.handleChangeText.bind(this);
		this.save = this.save.bind(this);
	}

	save() {
		this.props.modalShow({ open: false, id: this.props.data.id, text: this.state.text });
		this.setState({ text : '' });
	}

	handleChangeText(event) {
		this.setState({ text: event.target.value });
	}

	componentDidUpdate(prevProps) {
		const { open } = prevProps.data;
		if (open != this.props.data.open && open) {
			this.setState({ text: '' });
		} else if (open != this.props.data.open && !open) {
			this.setState({ text: this.props.data.text });
		}
	}

	render() {
		const { open } = this.props.data;
		const title = 'Комментарий № ' + this.props.data.id;

		return (
			<Modal size="small" open={open}>
				<Modal.Header>{title}</Modal.Header>
				<Modal.Content>
					<Form>
						<TextArea 
							placeholder="Введите комментарий"
							value={this.state.text}
							onChange={this.handleChangeText} />
					</Form>
				</Modal.Content>
				<Modal.Actions>
					<Button negative content='Отмена' onClick={() => this.props.modalShow({ open: false })}/>
					<Button positive content='Сохранить' onClick={this.save}/>
				</Modal.Actions>
			</Modal>
		);
	}
}

export default ModalExtend;