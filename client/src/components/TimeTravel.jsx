import { Button, Col, Row, Form } from "react-bootstrap";
import { useState} from "react";
import Swal from 'sweetalert2';
import TARDISicon from "../assets/TARDIS.png";
import API from "../API";

export default function TimeTravelComponent(props) {

    const [selectedDate, setSelectedDate] = useState(new Date());

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleButtonClick = () => {
        // You can customize this function to perform any action with the selected date
        // For now, it will just alert the selected date
        Swal.fire({
            title: `Travel to ${selectedDate.toLocaleDateString()}?`,
            text: `The T.A.R.D.I.S. can blend in anywhere, any time, any place. She can take you to the edges of the unknown and the frontiers of the impossible.`,
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'No, stay in the present!',
            confirmButtonText: 'Yes, allons-y!',
            cancelButtonColor: "red",
            confirmButtonColor: "#449d44",
            reverseButtons: false,
        }).then((result) => {
            if (result.isConfirmed) {
                try{
                    API.boardTardis(selectedDate);
                    Swal.fire(`We arrived at  ${selectedDate.toLocaleDateString()}!`, '"Time can be rewritten." - River Song', 'success');
                }catch(err){
                    props.setErrorMessage(`${err}`);
                }
            }
        });
    };

    return (
            <Row style={{marginBottom:"10px",  alignItems: "center"}}>
                <Col style={{flex:"0 0 auto", width:"fit-content"}}>
                    <Button onClick={handleButtonClick} style={{color:"white", backgroundColor:"#003b6f", border:"none"}}>
                        Time Travel
                        <img
                        src={TARDISicon}
                        alt="tardisIcon"
                        style={{ marginLeft: '4px',width: '2rem', height: '2rem' }} // Adjust the width and height as needed
                        />
                    </Button>
                </Col>
                <Col md={3}>
                    <Form.Group controlId="datePicker">
                        <Form.Control
                            type="date"
                            value={selectedDate.toISOString().split('T')[0]}
                            onChange={(e) => handleDateChange(new Date(e.target.value))}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </Form.Group>
                </Col>
            </Row>
    );
}
