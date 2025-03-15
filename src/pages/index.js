import "core-js/stable";
import "regenerator-runtime/runtime";
import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import { setButtonText } from "../utils/helpers.js";
import logoSrc from "../images/logo.svg";
import avatarSrc from "../images/avatar.jpg";
import editIconSrc from "../images/pencil.svg";
import addIconSrc from "../images/add-icon.svg";
import avatarEditIconSrc from "../images/pencil-light.svg";
import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "04cc443a-c254-4d72-b68b-d6354f20ae65",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, userInfo]) => {
    const { about, avatar, name, _id } = userInfo;
    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardsList.append(cardElement);
    });
  })
  .catch(console.error);

document.getElementById("header-logo").src = logoSrc;
document.getElementById("profile-avatar").src = avatarSrc;
document.getElementById("edit-icon").src = editIconSrc;
document.getElementById("add-icon").src = addIconSrc;
document.getElementById("avatar-edit-icon").src = avatarEditIconSrc;

const initialCards = [
  {
    name: "Val Thorens",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
  },
  {
    name: "Restaurant terrace",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
  },
  {
    name: "An outdoor cafe",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
  },
  {
    name: "A very long bridge, over the forest and through the trees",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
  },
  {
    name: "Tunnel with morning light",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
  },
  {
    name: "Mountain house",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
  },
  {
    name: "Golden Gate bridge",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/7-photo-by-griffin-wooldridge-from-pexels.jpg",
  },
];

const profileEditButton = document.querySelector(".profile__edit-button");
const cardModalButton = document.querySelector(".profile__add-button");
const avatarModalButton = document.querySelector(".profile__avatar-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSubmitButton = avatarModal.querySelector(".modal__submit-button");
const avatarInput = avatarModal.querySelector("#profile-picture-input");

const editModal = document.querySelector("#edit-modal");
const editFormElement = editModal.querySelector(".modal__form");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

const addCardModal = document.querySelector("#add-card-modal");
const addCardForm = addCardModal.querySelector(".modal__form");
const cardSubmitButton = addCardModal.querySelector(".modal__submit-button");
const addCardLinkInput = addCardModal.querySelector("#add-card-link-input");
const addCardNameInput = addCardModal.querySelector("#add-card-name-input");

const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");

const closeButtons = document.querySelectorAll(".modal__close-button");
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteSubmitButton = deleteModal.querySelector(".modal__delete-button");
const cancelButton = deleteModal.querySelector(".modal__cancel-button");

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

let selectedCard;
let selectedCardId;

closeButtons.forEach((button) => {
  const popup = button.closest(".modal");
  button.addEventListener("click", () => closeModal(popup));
});

function handleLike(evt, id) {
  const likeButton = evt.target;
  const isLiked = likeButton.classList.contains("card__like-button_liked");
  api
    .changeLikeStatus(id, isLiked)
    .then(() => {
      likeButton.classList.toggle("card__like-button_liked");
    })
    .catch(console.error);
}

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  const cardLikeButton = cardElement.querySelector(".card__like-button");
  cardLikeButton.addEventListener("click", (evt) => handleLike(evt, data._id));
  if (data.isLiked) {
    cardLikeButton.classList.add("card__like-button_liked");
  }
  const cardDeleteButton = cardElement.querySelector(".card__delete-button");
  cardDeleteButton.addEventListener("click", () =>
    handleDeleteCard(cardElement, data._id)
  );

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
  });

  return cardElement;
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscape);
  document.addEventListener("mousedown", closeOverlay);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscape);
  document.removeEventListener("mousedown", closeOverlay);
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();

  const cardSubmitButton = evt.submitter;
  setButtonText(cardSubmitButton, true);

  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(cardSubmitButton, false);
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  setButtonText(cardSubmitButton, true);

  api
    .addCard({
      name: addCardNameInput.value,
      link: addCardLinkInput.value,
    })
    .then((data) => {
      const cardElement = getCardElement(data);
      cardsList.prepend(cardElement);
      evt.target.reset();
      disableButton(cardSubmitButton, settings);
      closeModal(addCardModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(cardSubmitButton, false);
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  setButtonText(avatarSubmitButton, true);
  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      avatarModal.src = data.avatar;
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(avatarSubmitButton, false);
    });
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  setButtonText(deleteSubmitButton, true, "Delete", "Deleting...");
  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(deleteSubmitButton, false, "Delete", "Deleting...");
    });
}

function handleEscape(evt) {
  if (evt.key === "Escape") {
    const modalOpened = document.querySelector(".modal_opened");
    closeModal(modalOpened);
  }
}

function closeOverlay(evt) {
  if (evt.target.classList.contains("modal")) {
    closeModal(evt.target);
  }
}

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(
    editFormElement,
    [editModalNameInput, editModalDescriptionInput],
    settings
  );

  openModal(editModal);
});

editFormElement.addEventListener("submit", handleEditFormSubmit);
addCardForm.addEventListener("submit", handleAddCardSubmit);

cardModalButton.addEventListener("click", () => {
  openModal(addCardModal);
});

avatarModalButton.addEventListener("click", () => {
  openModal(avatarModal);
});
avatarForm.addEventListener("submit", handleAvatarSubmit);

deleteForm.addEventListener("submit", handleDeleteSubmit);

cancelButton.addEventListener("click", () => closeModal(deleteModal));

enableValidation(settings);
