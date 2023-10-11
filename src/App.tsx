
import './App.css';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Job } from './Interfaces/Jobs';
import { Modal, Button, Form, FormControl } from 'react-bootstrap';
import { format, getDate } from 'date-fns';


function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isModalOpenConfig, setIsModalOpenConfig] = useState(false);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState(0);


  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formEmailConfig, setformEmailConfig] = useState(false);


  //#region  propriedades
  const statusMap: Record<number, string> = {
    1: 'Pendente',
    2: 'Em Progresso',
    3: 'Concluído',
    // Add more status values as needed
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    executionDate: '',
    jobStatus: 1,
  });

  const [taskId, setTaskId] = useState(Number);
  const [updateName, setUpdateName] = useState('');
  const [updateEmail, setUpdateEmail] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [updateExecutionDate, setUpdateExecutionDate] = useState('');
  const [updateJobStatus, setUpdateJobStatus] = useState(1);
  const [taskToDelete, setTaskToDelete] = useState(1);
  const [emailInUse, setEmailInUse] = useState("");

  const [formErrors, setFormErrors] = useState({
    name: '',
    description: '',
    createDate: '',
    executionDate: '',
  });

  const [configErro, setConfigErro] = useState({
    email: ''
  });
  //#endregion

  //#region abertura e fechamento de modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openUpdateModal = () => {
    setIsUpdateModalOpen(true);
  };

  // Função para fechar o modal de atualização
  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };


  const openDeleteModal = (taskId: number) => {
    setTaskToDelete(taskId);
    setIsDeleteModalOpen(true);
  }
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  }
  const confirmDeleteJob = () => {
    setIsDeleteModalOpen(false);
    handleDelteJob();
  }

  const openModalConfig = async () => {
    const email = await axios.get(`https://todolistapii.azurewebsites.net/api/Email/${1}`)
    var emailInUse = email.data;
    console.log(emailInUse);
    setEmailInUse(emailInUse.emailSend);
    setIsModalOpenConfig(true);
  }
  const closeModalConfig = () => {
    setIsModalOpenConfig(false);
  }
  const openSendEmail = () => {
    setIsEmailModalOpen(true);
  }
  const closeSendEmail = () => {
    setIsEmailModalOpen(false);
  }

  //#endregion


  //#region metados para alterações dos formulários
  const handleFormChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const FormEditJob = async (taskId: number) => {
    // Encontre a tarefa com base no ID (taskId) e preencha o modal de edição com os detalhes dela
    const task = await axios.get(`https://todolistapii.azurewebsites.net/api/Job/${taskId}`);


    const taskData = task.data;



    setTaskId(taskId);
    setUpdateName(taskData.name);
    setUpdateDescription(taskData.description);
    setUpdateExecutionDate(taskData.executionDate);
    setUpdateJobStatus(taskData.jobStatus);
    openUpdateModal();


  };

  const FormSendEmail = (taskId: number) => {

    openSendEmail();

    setTaskId(taskId);
  }

  //#endregion

  //#region validações de campos
  const validateForms = () => {


    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Obtém a data de formData.executionDate (sem hora) como um objeto Date
    const executionDate = new Date(formData.executionDate);
    executionDate.setHours(0, 0, 0, 0);

    if (formData.name.trim() == '' && formData.executionDate.trim() == '') {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        name: 'Nome é obrigatório.',
        executionDate: 'O campo data para execução é obrigatório.'
      }));
      return true;
    }
    if (formData.name.length < 3) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        name: 'O campo nome deve conter no minímo 3 caracteres.'
      }));
      return true;
    }

    if (executionDate < currentDate) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        executionDate: 'A data de execução não pode ser menor que a data atual.'
      }));
      return true;
    }

    else {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        name: '',
        description: '',
        executionDate: ''// Limpa a mensagem de erro se for válido
      }));


      return false;
    }

  };


  const validateFormsUpdate = () => {


    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Obtém a data de formData.executionDate (sem hora) como um objeto Date
    const executionDate = new Date(updateExecutionDate);
    executionDate.setHours(0, 0, 0, 0);

    if (updateName.trim() == '' && updateExecutionDate.trim() == '') {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        name: 'Nome é obrigatório.',
        executionDate: 'O campo data para execução é obrigatório.'
      }));
      return true;
    }
    if (updateName.length < 3) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        name: 'O campo nome deve conter no minímo 3 caracteres.'
      }));
      return true;
    }

    if (executionDate < currentDate) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        executionDate: 'A data de execução não pode ser menor que a data atual.'
      }));
      return true;
    }

    else {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        name: '',
        description: '',
        executionDate: ''// Limpa a mensagem de erro se for válido
      }));


      return false;
    }

  };
  //#endregion


  const headers = {
    'ngrok-skip-browser-warning': 'true', // Você pode definir qualquer valor aqui
  };
  //#region  metado para realizar as operações de CRUD

  useEffect(() => {
    async function fetchData() {
      try {
        //const res = await axios.get<Job[]>('https://jaguar-darling-gratefully.ngrok-free.app/api/job', { headers });
        const res = await axios.get<Job[]>('https://todolistapii.azurewebsites.net/api/job');
        setJobs(res.data);
      } catch (error) {
        console.error("Erro ao buscar dados da API", error);
      }
    }

    fetchData();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForms() == true) {
      setFormSubmitted(true);
    }

    else {

      try {

        // Faça a solicitação POST para a API com os dados do formData
        const response = await axios.post('https://todolistapii.azurewebsites.net/api/Job', formData);

        const jobId = response.data;


        const res = await axios.get<Job[]>('https://todolistapii.azurewebsites.net/api/Job');


        setJobs(res.data);

        // Após o sucesso da criação, você pode fechar o modal e redefinir o formulário
        closeModal();
        FormSendEmail(jobId.id)

        setFormData({
          name: '',
          description: '',
          executionDate: '',
          jobStatus: 1,
        });

      } catch (error) {
        // Se ocorrer um erro na solicitação, você pode tratá-lo aqui
        console.error('Erro ao criar tarefa:', error);
      }

    }

  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();


    if (validateFormsUpdate() == true) {
      setFormSubmitted(true);

    }
    else {
      try {

        closeUpdateModal();



        const response = await axios.put(`https://todolistapii.azurewebsites.net/api/Job/${taskId}`, {
          id: taskId,
          name: updateName,
          description: updateDescription,
          executionDate: updateExecutionDate,
          jobStatus: updateJobStatus
        });


        // Atualize a lista de tarefas após a atualização
        const res = await axios.get<Job[]>('https://todolistapii.azurewebsites.net/api/Job');
        setJobs(res.data);

      } catch (error) {
        // Se ocorrer um erro na solicitação, você pode tratá-lo aqui
        console.error('Erro ao atualizar tarefa:', error);
      }
    }
  };

  const handleDelteJob = async () => {

    if (taskToDelete !== null) {
      try {

        await axios.delete(`https://todolistapii.azurewebsites.net/api/Job/${taskToDelete}`);


        const updatedJobs = jobs.filter((job) => job.id !== taskToDelete);
        setJobs(updatedJobs);

        closeDeleteModal();
      } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
      }
    }


  };

  const handleConfigEmail = async () => {

    if (validateFormsUpdate() == true) {
      setFormSubmitted(true);

    }

    try {
      const response = await axios.put(`https://todolistapii.azurewebsites.net/api/Email/${1}`, {
        id: 1,
        emailSend: updateEmail,

      });
      closeModalConfig();
    } catch (error) {
      
      
      alert('Email inválido');
      // Se ocorrer um erro na solicitação, você pode tratá-lo aqui
      console.error('Erro ao atualizar tarefa:', error);
    }


  }

  const handleSendEmail = async () => {

    const response = await axios.get(`https://todolistapii.azurewebsites.net/api/Job/${taskId}`)

    const res = response.data;

    const executionDate = new Date(res.executionDate);

    const formattedDate = format(executionDate, 'dd/MM/yyyy HH:mm:ss');

    console.log("chegou aqui" + executionDate);

    const sendEmail = await axios.post(`https://todolistapii.azurewebsites.net/api/SendEmail?jobId=${res.id}&timeSendEmail=${delayMinutes}`,
      {
        subject: "Tarefa a ser executada",
        body: `Olá, esta é uma notificação para informar que uma tarefa deverá executada em breve.\n\n
      Detalhes da tarefa:\n
      - Nome: ${res.name}\n
      - Descrição: ${res.description}\n
      - Data de Execução: ${formattedDate}\n

      Atenciosamente,\n
      TodoListApi
      `
      });

    closeSendEmail();

    alert('Email agendado com sucesso!');

  }
  //#endregion


  return (
    <div className="container">
      <div className='job-container'>
        <div className='cfg-button'>
          <button className='config-button' onClick={openModalConfig}>Configuração</button>
        </div>
        <h2 className='titulo'>Lista de Tarefas</h2>
        <div className='create-button'>
          <button className='include-button' onClick={openModal}>Incluir</button>
        </div>


        {/* Render the list of tasks from the API */}
        <ul>
          {jobs && jobs.map((job, index) => (
            <li key={index} className="task-item">
              <div className="task-info">
                <strong>Nome:</strong> {job.name}<br />
                <strong>Descrição:</strong> {job.description.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}<br />
                <strong>Data para Execução:</strong> {format(new Date(job.executionDate), 'dd/MM/yyyy HH:mm:ss')}<br />
                <strong>Status:</strong> {statusMap[job.jobStatus] || `Status Desconhecido (${job.jobStatus})`}
              </div>
              <div className="action-buttons">
                <button className="edit-button" onClick={() => FormEditJob(job.id)}>Editar</button>
                <button className="delete-button" onClick={() => openDeleteModal(job.id)}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Task creation modal */}
      <Modal show={isModalOpen} onHide={closeModal}>
        <Modal.Header>
          <Modal.Title>Criar Tarefa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="name">
              <Form.Label>Nome:</Form.Label>
              <Form.Control
                maxLength={100}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                onBlur={validateForms}
              />
            </Form.Group>
            {formSubmitted && <span className="error-message">{formErrors.name}</span>}
            <Form.Group controlId="description">
              <Form.Label>Descrição:</Form.Label>
              <Form.Control
                maxLength={100}
                type="text"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                onBlur={validateForms}
              />
            </Form.Group>
            {formSubmitted && <span className="error-message">{formErrors.description}</span>}
            <Form.Group controlId="executionDate">
              <Form.Label>Data e Hora para Execução:</Form.Label>
              <Form.Control
                type="datetime-local"
                name="executionDate"
                value={formData.executionDate}
                onChange={handleFormChange}
                onBlur={validateForms}
              />
            </Form.Group>
            {formSubmitted && <span className="error-message">{formErrors.executionDate}</span>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Fechar
          </Button>
          <Button variant="primary" onClick={handleCreateJob}>
            Criar Tarefa
          </Button>
        </Modal.Footer>
      </Modal>



      {/* Task update modal */}
      <Modal show={isUpdateModalOpen} onHide={closeUpdateModal}>
        <Modal.Header>
          <Modal.Title>Atualizar Tarefa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="name">
              <Form.Label>Nome:</Form.Label>
              <Form.Control
                maxLength={100}
                type="text"
                name="name"
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
              />
            </Form.Group>
            {formSubmitted && <span className="error-message">{formErrors.name}</span>}
            <Form.Group controlId="description">
              <Form.Label>Descrição:</Form.Label>
              <Form.Control
                maxLength={100}
                type="text"
                name="description"
                value={updateDescription}
                onChange={(e) => setUpdateDescription(e.target.value)}
              />
            </Form.Group>
            {formSubmitted && <span className="error-message">{formErrors.description}</span>}
            <Form.Group controlId="executionDate">
              <Form.Label>Data e Hora para Execução:</Form.Label>
              <Form.Control
                type="datetime-local"
                name="executionDate"
                value={updateExecutionDate ? format(new Date(updateExecutionDate), "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={(e) => setUpdateExecutionDate(e.target.value)}
              />
            </Form.Group>
            {formSubmitted && <span className="error-message">{formErrors.executionDate}</span>}
            <Form.Group controlId="jobStatus">
              <Form.Label>Status:</Form.Label>
              <Form.Control
                as="select"
                name="jobStatus"
                value={updateJobStatus}
                onChange={(e) => setUpdateJobStatus(Number(e.target.value))}
              >
                <option value={1}>Pendente</option>
                <option value={2}>Em Progresso</option>
                <option value={3}>Concluído</option>
              </Form.Control>

            </Form.Group>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeUpdateModal}>
            Fechar
          </Button>
          <Button variant="primary" onClick={handleUpdateJob}>
            Atualizar Tarefa
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de exclusão */}
      <Modal show={isDeleteModalOpen} onHide={closeDeleteModal}>
        <Modal.Header>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {taskToDelete !== null && (
            <>
              <p>Tem certeza de que deseja excluir a tarefa:</p>
              <p>Nome: {jobs.find((job) => job.id === taskToDelete)?.name}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button style={{ backgroundColor: 'black', color: 'white' }} onClick={closeDeleteModal}>
            Cancelar
          </Button>
          <Button style={{ backgroundColor: 'red', color: 'white' }} onClick={confirmDeleteJob}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de configurações */}
      <Modal show={isModalOpenConfig} onHide={closeModalConfig}>
        <Modal.Header>
          <Modal.Title>Configurações</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="email">
            <Form.Label>Email Para Envio das Notificações:</Form.Label>
            <Form.Control
              maxLength={100}
              type="text"
              name="Email"
              value={updateEmail}
              onChange={(e) => setUpdateEmail(e.target.value)}
            />

            <Form.Label>Email Em Uso:</Form.Label>
            <Form.Control
              type="text"
              name="Email"
              value={emailInUse}
              readOnly={true}
              disabled={true}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button style={{ backgroundColor: 'green', color: 'white' }} onClick={handleConfigEmail}>
            Salvar
          </Button>
          <Button style={{ backgroundColor: 'black', color: 'white' }} onClick={closeModalConfig}>
            Sair
          </Button>

        </Modal.Footer>
      </Modal>
      {formEmailConfig && <span className="error-message">{configErro.email}</span>}
      <Modal show={isEmailModalOpen} onHide={closeSendEmail}>
        <Modal.Header >
          <Modal.Title>Enviar Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Deseja enviar o email?</p>
          <Form.Check
            type="checkbox"
            label="Sim"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
          />
          {sendEmail && (
            <div>
              <Form.Label>Atrasar envio em minutos:</Form.Label>
              <FormControl
                type="number"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(parseInt(e.target.value))}
              />
              <Button style={{ backgroundColor: 'green', color: 'white' }} onClick={handleSendEmail}
              // Desabilita o botão se sendEmail for falso
              >
                Enviar
              </Button>
            </div>
          )}

        </Modal.Body>
        <Modal.Footer>
          <Button style={{ backgroundColor: 'black', color: 'white' }} onClick={closeSendEmail}>
            Cancelar
          </Button>


        </Modal.Footer>
      </Modal>
    </div>

  );
}


export default App;
